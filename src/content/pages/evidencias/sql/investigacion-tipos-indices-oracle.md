---
title: "Investigación: Tipos de índices en Oracle y cuándo se usan"
---

## Introducción

Un índice es una estructura adicional que la base de datos mantiene para
encontrar filas sin tener que leer toda la tabla, igual que el índice de un
libro evita leerlo de principio a fin. Pero crear un índice no garantiza que se
use: depende del tipo de índice, de cómo está escrita la consulta y de cuántas
filas devuelve.

Esta investigación presenta los tipos de índice más usados en Oracle (B-tree,
compuesto, basado en función y bitmap), explica por qué a veces el optimizador
los ignora y resume cuándo conviene cada uno. Complementa la parte de índices y
`EXPLAIN PLAN` del taller del Banco Andino.

## 1. Índice B-tree (el predeterminado)

Cuando se ejecuta `CREATE INDEX` sin indicar el tipo, Oracle crea un índice
**B-tree** (árbol balanceado). Es el tipo más común: todas las hojas del árbol
están a la misma profundidad, así que encontrar cualquier valor cuesta
aproximadamente lo mismo, y cada entrada de una hoja apunta a una fila de la
tabla mediante su `ROWID`.

```sql
CREATE INDEX idx_transaccion_cuenta ON transaccion (id_cuenta);
```

- **Ideal para:** columnas con muchos valores distintos (alta selectividad),
  como identificadores, correos o fechas exactas.
- **Ojo con los nulos:** las filas en las que todas las columnas del índice son
  `NULL` no se guardan en un B-tree. Por eso una condición `WHERE columna IS NULL`
  normalmente no puede usar ese índice.

Las claves primarias y las restricciones `UNIQUE` crean automáticamente un
índice único. Las claves foráneas **no**, aunque suele ser buena idea indexarlas
porque se usan en los `JOIN`.

## 2. Índice compuesto

Un índice compuesto (o concatenado) incluye varias columnas. Sirve para
consultas que filtran por **todas** sus columnas o por la **parte inicial**
(las primeras columnas) del índice. Por eso el orden importa:

```sql
CREATE INDEX idx_trans_cuenta_fecha ON transaccion (id_cuenta, fecha);
```

| Condición de la consulta | ¿Aprovecha el índice de forma directa? |
|:---|:---|
| `WHERE id_cuenta = :c` | Sí (usa la primera columna) |
| `WHERE id_cuenta = :c AND fecha >= :f` | Sí (usa las dos columnas) |
| `WHERE fecha >= :f` | Normalmente no (falta la columna inicial) |

Una regla práctica es poner primero la columna que se compara por igualdad y
después la que se usa en rangos u ordenamientos. Es la misma idea que la regla
ESR que usamos en los índices de MongoDB.

## 3. Índice basado en función

Si la consulta aplica una función a la columna, por ejemplo `UPPER(nombre)` o
`TRUNC(fecha)`, un índice normal sobre `nombre` o `fecha` no sirve, porque el
índice guarda los valores de la columna y no los valores ya transformados. La
solución es indexar directamente la expresión:

```sql
-- Esta consulta no puede usar un índice normal sobre "correo"
SELECT * FROM cliente WHERE UPPER(correo) = 'GABY@EJEMPLO.COM';

-- Índice sobre la expresión
CREATE INDEX idx_cliente_correo_upper ON cliente (UPPER(correo));
```

Si el índice usa una función creada por el usuario, esa función debe declararse
`DETERMINISTIC` (es decir, que siempre devuelva el mismo resultado para la
misma entrada). Un índice sobre una **columna virtual** es equivalente a un
índice basado en función, lo que se conecta con el laboratorio de columnas
virtuales.

## 4. Índice bitmap

En un índice **bitmap**, cada valor distinto de la columna tiene un mapa de bits
donde cada bit representa una fila. Así, una sola entrada del índice apunta a
muchas filas, mientras que en un B-tree cada entrada apunta a una sola.

```sql
CREATE BITMAP INDEX idx_cuenta_tipo ON cuenta (tipo_cuenta);
```

- **Ventajas:** son muy compactos para columnas con **pocos valores distintos**
  (como estado, tipo o género), se pueden combinar rápidamente con operaciones
  `AND` y `OR`, y a diferencia del B-tree sí incluyen las filas con `NULL`.
- **Gran desventaja:** afectan mucho la **concurrencia de escritura**. Al
  modificar una fila hay que actualizar mapas de bits que cubren muchas filas,
  así que varias sesiones que escriben al mismo tiempo se bloquean entre sí.

Por eso los bitmap son adecuados para bodegas de datos y reportes, donde casi
todo es lectura, y no para sistemas transaccionales como un banco, donde hay
muchas escrituras simultáneas.

## 5. ¿Por qué el optimizador no usa mi índice?

Tener un índice no obliga a usarlo. Algunas razones frecuentes:

1. **Se aplica una función a la columna** en el `WHERE` y el índice no es basado
   en función (la consulta no es *sargable*).
2. **No se usa la columna inicial** de un índice compuesto.
3. **La consulta devuelve una gran parte de la tabla:** si hay que leer muchas
   filas, un recorrido completo (*full table scan*) puede ser más barato que ir
   y volver entre el índice y la tabla.
4. **Se buscan valores `NULL`** con un índice B-tree.
5. **Conversiones implícitas de tipo**, por ejemplo comparar una columna
   `VARCHAR2` con un número.

La forma de comprobarlo es revisar el plan con `EXPLAIN PLAN` y
`DBMS_XPLAN.DISPLAY`, como hicimos en el taller.

## Comparación general

| Tipo | Estructura | Mejor para | Evitar cuando |
|:---|:---|:---|:---|
| B-tree | Árbol balanceado, una entrada por fila | Columnas selectivas, claves | Se buscan `NULL` o casi toda la tabla |
| Compuesto | B-tree de varias columnas | Filtros que combinan columnas | La consulta no usa la columna inicial |
| Basado en función | B-tree o bitmap sobre una expresión | Consultas con `UPPER`, `TRUNC`, cálculos | La función no es determinista |
| Bitmap | Mapa de bits por valor | Pocos valores distintos, reportes | Hay muchas escrituras concurrentes |

## Conclusiones

Elegir un índice es pensar en las consultas reales: qué columnas se filtran,
en qué orden, cuántas filas devuelven y cuántas escrituras recibe la tabla. En
el Banco Andino vimos que un índice puede existir y aun así no usarse si la
consulta envuelve la columna en una función, y que reescribir el predicado o
crear un índice basado en función cambia el plan de ejecución. Además, cada
índice tiene un costo: ocupa espacio y vuelve más lentas las inserciones y
actualizaciones, así que conviene crear solo los que de verdad aportan.

## Fuentes

1. Oracle. *Database Concepts: Indexes and Index-Organized Tables*.  
   https://docs.oracle.com/database/122/CNCPT/indexes-and-index-organized-tables.htm
2. Oracle. *SQL Language Reference: CREATE INDEX*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-INDEX.html
3. Oracle. *SQL Tuning Guide: Optimizer Access Paths*.  
   https://docs.oracle.com/database/122/TGSQL/optimizer-access-paths.htm
4. Oracle SQL Blog. *How to Create and Use Indexes in Oracle Database*.  
   https://blogs.oracle.com/sql/post/how-to-create-and-use-indexes-in-oracle-database

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database
