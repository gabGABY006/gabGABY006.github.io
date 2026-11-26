---
title: "Solución Quiz 1: SQL avanzado en Oracle"
---

## Título

Solución del quiz de joins, subconsultas, CTE y funciones analíticas

## Descripción

Quiz individual de Bases de Datos 2 sobre la base de una aerolínea ficticia
(AeroAndes). En la primera pregunta había que encontrar los defectos de una
consulta que "funcionaba bien" según un analista y reescribirla. En la segunda
había que construir consultas con CTE (`WITH`) y funciones analíticas: un
*ranking* mensual, la corrección de un acumulado y la detección de caídas de un
mes a otro.

Aquí está la solución completa, con el porqué de cada respuesta.

<div class="evidence-callout">
<strong>La clave de casi todo el quiz: el orden en que Oracle evalúa una consulta</strong>
<p><code>FROM</code> y <code>JOIN</code> → <code>WHERE</code> (aquí se asigna <code>ROWNUM</code>) → <code>GROUP BY</code> → <code>HAVING</code> → <code>SELECT</code> (aquí se calculan las funciones analíticas) → <code>ORDER BY</code>.</p>
<p>Varios de los defectos salen de usar algo antes de que exista o de filtrar antes de tiempo.</p>
</div>

## Esquema y reglas de negocio

```text
AEROPUERTO  (cod_aeropuerto PK, ciudad, pais)
AERONAVE    (id_aeronave PK, modelo, capacidad)
VUELO       (id_vuelo PK, num_vuelo, fecha_salida, cod_origen FK,
             cod_destino FK, id_aeronave FK)
PASAJERO    (id_pasajero PK, nombre, ciudad_residencia,
             id_pasajero_referido FK NULL)
RESERVA     (id_reserva PK, id_vuelo FK, id_pasajero FK, fecha_compra,
             tarifa, clase, estado)
INCIDENCIA  (id_vuelo FK, tipo, minutos_retraso)
```

- Un vuelo puede tener cero, una o varias incidencias.
- `estado` de una reserva: `'CONFIRMADA'`, `'VOLADA'` o `'ANULADA'`. Las anuladas **no** generan ingreso.
- `id_pasajero_referido` guarda el pasajero que refirió a otro; es **nulo** para la mayoría.
- `fecha_compra` y `fecha_salida` son `DATE` sin componente horario.
- Motor: Oracle Database 19c.

## Pregunta 1 — Diagnóstico y reescritura

El área de planeación quería las cinco rutas con mayor ingreso desde el 1 de
enero de 2026, **excluyendo** del cálculo a los pasajeros que hayan referido a
otro pasajero. El analista entregó esta consulta:

```sql
SELECT v.cod_origen || '-' || v.cod_destino      AS ruta,
       v.num_vuelo                              AS numero,
       COUNT(*)                                 AS incidencias,
       SUM(r.tarifa)                            AS ingreso,
       RANK() OVER (ORDER BY SUM(r.tarifa) DESC) AS puesto
FROM   vuelo v
JOIN   reserva r          ON r.id_vuelo = v.id_vuelo
LEFT JOIN incidencia i    ON i.id_vuelo = v.id_vuelo
WHERE  v.fecha_salida >= DATE '2026-01-01'
AND    ROWNUM <= 5
AND    r.id_pasajero NOT IN (SELECT p.id_pasajero_referido
                             FROM   pasajero p)
GROUP BY v.cod_origen, v.cod_destino
ORDER BY ingreso DESC;
```

### a. Defectos de la consulta

**Defecto 1 — `v.num_vuelo` no está en el `GROUP BY`**

- **Dónde:** en el `SELECT` (`v.num_vuelo AS numero`).
- **Efecto:** **impide que la sentencia se ejecute.** Oracle lanza `ORA-00979: not a GROUP BY expression`.
- **Por qué:** después del `GROUP BY` queda una fila por ruta, pero una ruta tiene muchos vuelos con números distintos. En el `SELECT` solo pueden aparecer columnas del `GROUP BY`, funciones de agregado o constantes. La solución es quitar la columna, ya que el reporte es por ruta.

**Defecto 2 — `ROWNUM <= 5` en el `WHERE`**

- **Dónde:** en el `WHERE`.
- **Efecto:** se ejecuta, pero **devuelve un resultado incorrecto.**
- **Por qué:** `ROWNUM` se asigna mientras se leen las filas en el `WHERE`, **antes** del `GROUP BY` y del `ORDER BY`. La consulta toma las 5 primeras filas que el motor encuentre (cinco combinaciones reserva–incidencia cualesquiera) y agrupa solo esas. No son las 5 rutas de mayor ingreso, sino un ingreso calculado sobre 5 filas arbitrarias.

**Defecto 3 — `NOT IN` con una subconsulta que devuelve `NULL`**

- **Dónde:** en el `WHERE` (`r.id_pasajero NOT IN (SELECT p.id_pasajero_referido ...)`).
- **Efecto:** se ejecuta, pero **no devuelve ninguna fila.**
- **Por qué:** `id_pasajero_referido` es nulo para la mayoría de los pasajeros, así que la subconsulta trae valores `NULL`. `x NOT IN (a, b, NULL)` equivale a `x <> a AND x <> b AND x <> NULL`, y `x <> NULL` nunca es verdadero (es *desconocido*). Por eso la condición nunca se cumple y el resultado queda vacío. Se corrige con `NOT EXISTS` o filtrando `WHERE p.id_pasajero_referido IS NOT NULL` dentro de la subconsulta.

**Defecto 4 — El `LEFT JOIN` con `INCIDENCIA` multiplica las filas**

- **Dónde:** en el `FROM` (`LEFT JOIN incidencia i`), con efecto en `COUNT(*)` y `SUM(r.tarifa)`.
- **Efecto:** se ejecuta, pero **los totales salen inflados.**
- **Por qué:** un vuelo con 3 incidencias hace que cada una de sus reservas aparezca 3 veces, así que `SUM(r.tarifa)` cuenta 3 veces cada tarifa. Además, `COUNT(*)` no cuenta incidencias sino filas del *join* (reservas × incidencias). Por el `LEFT JOIN`, un vuelo **sin** incidencias igual aporta una fila por reserva, así que también "suma" incidencias que no existen.

**Defecto 5 — No se excluyen las reservas anuladas**

- **Dónde:** falta una condición en el `WHERE`.
- **Efecto:** se ejecuta, pero **el ingreso es incorrecto.**
- **Por qué:** las reglas de negocio dicen que las reservas `'ANULADA'` no generan ingreso, y la consulta suma todas las tarifas sin mirar el estado. Hace falta `r.estado IN ('CONFIRMADA', 'VOLADA')` (o `r.estado <> 'ANULADA'`).

**Lo que sí es correcto (no son defectos)**

- `ORDER BY ingreso DESC`: en Oracle el `ORDER BY` se evalúa **después** del `SELECT`, así que sí puede usar el alias `ingreso`. El `WHERE` y el `GROUP BY` no podrían.
- `RANK() OVER (ORDER BY SUM(r.tarifa) DESC)`: una función analítica sí puede ordenar por un agregado, porque se calcula después del `GROUP BY`.
- `DATE '2026-01-01'`: es un literal de fecha válido, y como `fecha_salida` no tiene hora, `>=` incluye todo el 1 de enero.

### b. Reescritura

Por ruta: ingreso total del período y número de vuelos **distintos** con al
menos una incidencia, limitado a las cinco rutas de mayor ingreso.

```sql
WITH reservas_validas AS (
    -- Reservas que generan ingreso, de vuelos del período,
    -- sin los pasajeros que refirieron a alguien
    SELECT v.cod_origen,
           v.cod_destino,
           r.tarifa
    FROM   reserva r
    JOIN   vuelo v ON v.id_vuelo = r.id_vuelo
    WHERE  v.fecha_salida >= DATE '2026-01-01'
    AND    r.estado IN ('CONFIRMADA', 'VOLADA')
    AND    NOT EXISTS (SELECT 1
                       FROM   pasajero p
                       WHERE  p.id_pasajero_referido = r.id_pasajero)
),
ingreso_ruta AS (
    -- Una fila por ruta con su ingreso
    SELECT cod_origen,
           cod_destino,
           SUM(tarifa) AS ingreso
    FROM   reservas_validas
    GROUP BY cod_origen, cod_destino
),
incidencias_ruta AS (
    -- Una fila por ruta con los vuelos distintos que tuvieron incidencias
    SELECT v.cod_origen,
           v.cod_destino,
           COUNT(DISTINCT v.id_vuelo) AS vuelos_con_incidencia
    FROM   vuelo v
    JOIN   incidencia i ON i.id_vuelo = v.id_vuelo
    WHERE  v.fecha_salida >= DATE '2026-01-01'
    GROUP BY v.cod_origen, v.cod_destino
)
SELECT ir.cod_origen || '-' || ir.cod_destino AS ruta,
       ir.ingreso,
       NVL(inc.vuelos_con_incidencia, 0)      AS vuelos_con_incidencia
FROM   ingreso_ruta ir
LEFT JOIN incidencias_ruta inc
       ON  inc.cod_origen  = ir.cod_origen
       AND inc.cod_destino = ir.cod_destino
ORDER BY ir.ingreso DESC, ruta
FETCH FIRST 5 ROWS ONLY;
```

**Por qué no repite el problema del conteo:** el ingreso y las incidencias se
agregan por separado, cada uno a una fila por ruta, antes de unirlos, así que
una incidencia nunca duplica una reserva; además, `COUNT(DISTINCT v.id_vuelo)`
cuenta vuelos y no filas.

Otros detalles de la reescritura:

- `NOT EXISTS` no tiene el problema de los `NULL` que tenía `NOT IN`.
- El límite de cinco se aplica con `FETCH FIRST 5 ROWS ONLY`, que en Oracle 12c o superior se evalúa **después** del `ORDER BY`, a diferencia de `ROWNUM` en el `WHERE`.
- El `LEFT JOIN` final conserva las rutas sin incidencias, y `NVL` les pone 0.

## Pregunta 2 — CTE y funciones analíticas

> **Supuesto:** el "ingreso de un mes" se calcula con el mes de `fecha_salida`
> del vuelo, como en la pregunta 1. Si se quisiera por mes de compra, basta con
> cambiar `v.fecha_salida` por `r.fecha_compra` en los filtros y en el
> `TRUNC`.

### a. Ranking mensual por ruta

Para cada mes de 2026, las tres rutas con mayor ingreso, con desempate
determinístico por el código de ruta menor alfabéticamente.

```sql
WITH ingreso_mes AS (
    SELECT TRUNC(v.fecha_salida, 'MM')         AS mes,
           v.cod_origen || '-' || v.cod_destino AS ruta,
           SUM(r.tarifa)                        AS ingreso
    FROM   reserva r
    JOIN   vuelo v ON v.id_vuelo = r.id_vuelo
    WHERE  r.estado IN ('CONFIRMADA', 'VOLADA')
    AND    v.fecha_salida >= DATE '2026-01-01'
    AND    v.fecha_salida <  DATE '2027-01-01'
    GROUP BY TRUNC(v.fecha_salida, 'MM'), v.cod_origen, v.cod_destino
),
ranking AS (
    SELECT mes,
           ruta,
           ingreso,
           ROW_NUMBER() OVER (PARTITION BY mes
                              ORDER BY ingreso DESC, ruta ASC) AS posicion
    FROM   ingreso_mes
)
SELECT TO_CHAR(mes, 'YYYY-MM') AS mes,
       ruta,
       ingreso,
       posicion
FROM   ranking
WHERE  posicion <= 3
ORDER BY mes, posicion;
```

- `PARTITION BY mes` reinicia la numeración en cada mes.
- `ORDER BY ingreso DESC, ruta ASC` hace el desempate determinístico: si dos rutas empatan en ingreso, queda primero la de código menor alfabéticamente. Por eso se usa `ROW_NUMBER` y no `RANK`, que les daría el mismo puesto a ambas.
- El año se filtra con un rango de fechas (`>= 2026-01-01` y `< 2027-01-01`) y no con `EXTRACT(YEAR ...)`, para no envolver la columna en una función.

**Por qué el filtro de la posición no puede ir en el `WHERE` de la misma
consulta:** las funciones analíticas se calculan después del `WHERE`, el
`GROUP BY` y el `HAVING`, así que cuando se evalúa el `WHERE` la columna
`posicion` todavía no existe (Oracle responde
`ORA-30483: window functions are not allowed here`). Por eso se calcula en una
CTE y se filtra en la consulta de afuera.

### b. Análisis de un acumulado incorrecto

```sql
SUM(r.tarifa) OVER (PARTITION BY v.cod_origen
                    ORDER BY r.fecha_compra) AS acumulado
```

**Por qué todas las reservas del mismo día muestran el mismo acumulado:**
cuando una función de ventana tiene `ORDER BY` pero no se escribe el marco,
Oracle aplica por defecto
`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Con `RANGE`, la "fila
actual" incluye a todas sus **pares**, es decir, las filas que tienen el mismo
valor en el `ORDER BY`. Como `fecha_compra` no tiene hora, todas las reservas
compradas el mismo día en el mismo aeropuerto son pares, entran juntas al
marco y reciben la misma suma: el total acumulado hasta el final de ese día.

Lo que se necesita es un marco por **filas físicas**
(`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`), que avanza de una reserva
a la vez. Además, hay que agregar un criterio de desempate al `ORDER BY` para
que el orden entre reservas del mismo día sea siempre el mismo.

**Corrección:**

```sql
SELECT r.id_reserva,
       r.fecha_compra,
       r.tarifa,
       SUM(r.tarifa) OVER (PARTITION BY v.cod_origen
                           ORDER BY r.fecha_compra, r.id_reserva
                           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acumulado
FROM   reserva r
JOIN   vuelo v ON v.id_vuelo = r.id_vuelo
ORDER BY v.cod_origen, r.fecha_compra, r.id_reserva;
```

| Marco | Qué incluye en la fila actual | Resultado con 3 compras del mismo día |
|:---|:---|:---|
| `RANGE ... CURRENT ROW` (por defecto) | La fila y todas sus pares con la misma fecha | Las 3 muestran el mismo total |
| `ROWS ... CURRENT ROW` (corrección) | Solo hasta la fila actual | El acumulado crece de una en una |

Si el acumulado solo debe sumar ingreso real, también se puede agregar
`WHERE r.estado <> 'ANULADA'`, aunque el enunciado de este punto no lo pide.

### c. Detección de caídas mensuales

Rutas y meses de 2026 en los que el ingreso cayó **más de un 30 %** respecto al
mes inmediatamente anterior de la misma ruta.

```sql
WITH ingreso_mes AS (
    -- Se incluye diciembre de 2025 para poder comparar enero de 2026
    SELECT v.cod_origen || '-' || v.cod_destino AS ruta,
           TRUNC(v.fecha_salida, 'MM')          AS mes,
           SUM(r.tarifa)                        AS ingreso
    FROM   reserva r
    JOIN   vuelo v ON v.id_vuelo = r.id_vuelo
    WHERE  r.estado IN ('CONFIRMADA', 'VOLADA')
    AND    v.fecha_salida >= DATE '2025-12-01'
    AND    v.fecha_salida <  DATE '2027-01-01'
    GROUP BY v.cod_origen, v.cod_destino, TRUNC(v.fecha_salida, 'MM')
),
con_anterior AS (
    SELECT ruta,
           mes,
           ingreso,
           LAG(mes)     OVER (PARTITION BY ruta ORDER BY mes) AS mes_anterior,
           LAG(ingreso) OVER (PARTITION BY ruta ORDER BY mes) AS ingreso_anterior
    FROM   ingreso_mes
)
SELECT ruta,
       TO_CHAR(mes, 'YYYY-MM')                                  AS mes,
       ingreso,
       ingreso_anterior,
       ROUND((ingreso - ingreso_anterior) / ingreso_anterior * 100, 2) AS variacion_pct
FROM   con_anterior
WHERE  mes >= DATE '2026-01-01'
AND    mes_anterior = ADD_MONTHS(mes, -1)        -- el mes anterior debe ser el inmediato
AND    ingreso < ingreso_anterior * 0.7          -- caída de más del 30 %
ORDER BY ruta, mes;
```

**Cómo se garantiza que no aparezcan rutas sin ventas en el mes anterior:**
`LAG` trae la fila anterior **que exista** para esa ruta. Si la ruta no tuvo
ventas en el mes anterior, esa fila no está en `ingreso_mes`, así que `LAG`
devuelve un mes más antiguo o `NULL` (cuando es el primer mes de la ruta). La
condición `mes_anterior = ADD_MONTHS(mes, -1)` exige que la fila anterior sea
exactamente el mes inmediatamente anterior. En los dos casos la condición es
falsa o desconocida, y la fila queda fuera del resultado. Esa misma condición
evita comparar, por ejemplo, abril con febrero cuando una ruta no voló en
marzo.

**Por qué no se puede resolver solo con `GROUP BY` y funciones de agregado:**
`GROUP BY` colapsa las filas en un grupo por ruta y mes, y una función de
agregado solo ve las filas de **su propio** grupo, así que no hay forma de
poner en la misma fila el ingreso de un mes y el del mes anterior. Sin
funciones analíticas habría que agregar primero por ruta y mes (en una CTE) y
luego hacer un **auto-join** de ese resultado consigo mismo: unir cada mes con
el mes anterior de la misma ruta mediante
`a.ruta = b.ruta AND b.mes = ADD_MONTHS(a.mes, -1)`. Como es un *join* interno,
también deja fuera los meses sin un mes anterior con ventas.

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database 19c
- Modalidad: individual
