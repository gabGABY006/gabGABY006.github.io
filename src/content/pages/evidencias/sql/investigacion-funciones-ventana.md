---
title: "Investigación: Funciones de ventana (analíticas) en Oracle"
---

## Introducción

Con `GROUP BY` se pueden calcular totales y promedios, pero a cambio se pierden
las filas individuales: si agrupo transacciones por cuenta, ya no veo cada
transacción. Las **funciones de ventana**, que Oracle llama **funciones
analíticas**, resuelven ese problema: calculan un valor a partir de un grupo de
filas relacionadas, pero devuelven **una fila por cada fila** del resultado.

Con ellas se pueden hacer *rankings*, acumulados, promedios móviles y
comparaciones con la fila anterior sin escribir subconsultas complicadas. Esta
investigación explica su sintaxis, las funciones más usadas y los detalles que
más confunden, con ejemplos de un caso bancario como el del Banco Andino.

## 1. Sintaxis general

Toda función de ventana lleva la cláusula `OVER`, que define sobre qué filas se
calcula:

```sql
funcion(argumentos) OVER (
    [PARTITION BY columnas]      -- divide las filas en grupos
    [ORDER BY columnas]          -- ordena las filas dentro de cada grupo
    [ROWS | RANGE ventana]       -- define el marco de filas para el cálculo
)
```

- **`PARTITION BY`** divide el resultado en grupos. Si se omite, todas las filas
  forman un solo grupo. No reduce filas como `GROUP BY`; solo marca dónde
  empieza y termina cada grupo para el cálculo.
- **`ORDER BY`** dentro de `OVER` ordena las filas de cada partición. Es
  obligatorio para funciones como `RANK`, `ROW_NUMBER` o `LAG`.
- **El marco (*window frame*)** indica qué filas alrededor de la actual entran
  en el cálculo, por ejemplo "las tres filas anteriores".

Un detalle importante: las funciones analíticas se calculan **al final** de la
consulta, después de los `JOIN`, `WHERE`, `GROUP BY` y `HAVING`, y solo antes del
`ORDER BY` final. Por eso solo pueden ir en la lista del `SELECT` o en el
`ORDER BY` (y, en las versiones más recientes, en la cláusula `QUALIFY`), pero
no en el `WHERE`.

## 2. Funciones de ranking

Las tres más comunes numeran filas según un orden, pero tratan los empates de
forma distinta:

```sql
SELECT id_cliente,
       saldo,
       ROW_NUMBER() OVER (ORDER BY saldo DESC) AS row_number,
       RANK()       OVER (ORDER BY saldo DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY saldo DESC) AS dense_rank
FROM   cuenta;
```

| Saldo | `ROW_NUMBER` | `RANK` | `DENSE_RANK` |
|:---|:---|:---|:---|
| 900.000 | 1 | 1 | 1 |
| 750.000 | 2 | 2 | 2 |
| 750.000 | 3 | 2 | 2 |
| 500.000 | 4 | 4 | 3 |

- **`ROW_NUMBER`** asigna un número distinto a cada fila, aunque haya empates.
- **`RANK`** da el mismo puesto a los empatados y luego **salta** posiciones
  (después de dos segundos puestos viene el cuarto).
- **`DENSE_RANK`** también da el mismo puesto a los empatados, pero **no deja
  huecos** (después de los segundos viene el tercero).

### Ejemplo: las 3 transacciones más grandes de cada cuenta

Como no se puede usar una función analítica en el `WHERE`, se calcula en una
subconsulta y se filtra afuera:

```sql
SELECT *
FROM (
    SELECT t.id_cuenta,
           t.fecha,
           t.monto,
           ROW_NUMBER() OVER (PARTITION BY t.id_cuenta
                              ORDER BY t.monto DESC) AS puesto
    FROM   transaccion t
)
WHERE puesto <= 3;
```

## 3. LAG y LEAD: comparar con otras filas

`LAG` trae el valor de una fila **anterior** y `LEAD` el de una fila
**siguiente**, dentro de la misma partición y según el orden indicado. Son
ideales para calcular cambios de un periodo a otro:

```sql
SELECT id_cuenta,
       mes,
       saldo_final,
       LAG(saldo_final, 1, 0) OVER (PARTITION BY id_cuenta ORDER BY mes) AS saldo_mes_anterior,
       saldo_final
         - LAG(saldo_final, 1, 0) OVER (PARTITION BY id_cuenta ORDER BY mes) AS variacion
FROM   saldo_mensual;
```

El segundo argumento indica cuántas filas hacia atrás mirar y el tercero es el
valor por defecto cuando no existe esa fila (por ejemplo, en el primer mes).

## 4. Acumulados y promedios móviles

Las funciones de agregación de siempre (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`)
también se pueden usar como funciones de ventana:

```sql
SELECT id_cuenta,
       fecha,
       monto,
       -- saldo acumulado: desde la primera fila hasta la actual
       SUM(monto) OVER (PARTITION BY id_cuenta
                        ORDER BY fecha
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acumulado,
       -- promedio móvil de las últimas 3 transacciones
       AVG(monto) OVER (PARTITION BY id_cuenta
                        ORDER BY fecha
                        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS promedio_movil_3
FROM   transaccion;
```

### ROWS frente a RANGE (el detalle que más confunde)

- **`ROWS`** cuenta **filas físicas** hacia adelante o hacia atrás desde la fila
  actual.
- **`RANGE`** usa un **desplazamiento lógico** sobre el valor del `ORDER BY`
  (por ejemplo, "los últimos 7 días"). Solo admite una columna de orden de tipo
  numérico o de fecha.

Si se escribe `ORDER BY` dentro de `OVER` pero no se indica el marco, Oracle usa
por defecto `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Con `RANGE`, las
filas que tienen el mismo valor en el `ORDER BY` se tratan como un solo bloque y
reciben el mismo resultado. Por eso, si dos transacciones tienen la misma fecha,
el "acumulado" las suma juntas. Cuando se quiere un acumulado fila por fila, lo
más seguro es escribir el marco con `ROWS` de forma explícita.

## Comparación general

| Necesidad | Función | Ejemplo de uso |
|:---|:---|:---|
| Numerar filas sin empates | `ROW_NUMBER` | Top N por grupo, eliminar duplicados |
| Puesto con empates y saltos | `RANK` | Clasificación de clientes por saldo |
| Puesto con empates sin saltos | `DENSE_RANK` | Niveles o categorías consecutivas |
| Comparar con la fila anterior o siguiente | `LAG`, `LEAD` | Variación mensual del saldo |
| Totales que crecen fila a fila | `SUM ... ROWS UNBOUNDED PRECEDING` | Saldo acumulado |
| Suavizar una serie | `AVG ... ROWS n PRECEDING` | Promedio móvil |

## Conclusiones

Las funciones de ventana permiten responder preguntas analíticas sin perder el
detalle de cada fila y sin depender de subconsultas correlacionadas. En el
taller del Banco Andino las usamos para *rankings*, series de tiempo con
acumulados y promedios móviles, y comparaciones con `LAG`. Lo más importante que
encontré es entender el marco de la ventana: la diferencia entre `ROWS` y
`RANGE`, y el marco que Oracle usa por defecto, cambia los resultados cuando hay
valores repetidos en el orden.

## Fuentes

1. Oracle. *SQL Language Reference: Analytic Functions*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/Analytic-Functions.html
2. Oracle. *Data Warehousing Guide: SQL for Analysis and Reporting*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/23/dwhsg/sql-analysis-reporting-data-warehouses.html
3. Oracle Connect. *Leading Ranks and Lagging Percentages: Analytic Functions, Continued*.  
   https://blogs.oracle.com/connect/leading-ranks-and-lagging-percentages-analytic-functions-continued

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database
