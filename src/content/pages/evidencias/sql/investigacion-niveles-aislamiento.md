---
title: "Investigación: Niveles de aislamiento de transacciones en Oracle"
---

## Introducción

Cuando varias sesiones trabajan al mismo tiempo sobre los mismos datos, la base
de datos tiene que decidir qué ve cada transacción de lo que hacen las demás.
Esa decisión es el **nivel de aislamiento**: entre más aislada esté una
transacción, más se comporta como si estuviera sola en el sistema, pero también
más probable es que tenga que esperar o fallar por conflictos.

El estándar SQL (ANSI/ISO) define cuatro niveles según los fenómenos de lectura
que permiten. Oracle no implementa los cuatro: ofrece *read committed* (el
predeterminado) y *serializable*, más un modo *read-only* que no hace parte del
estándar. Esta investigación explica qué significa cada uno, cómo se configura y
cómo se relaciona con lo que vimos en el taller del Banco Andino.

## 1. Los fenómenos de lectura

El estándar describe los niveles a partir de tres problemas que pueden aparecer
cuando dos transacciones se cruzan:

- **Lectura sucia (*dirty read*):** una transacción lee datos que otra todavía
  no ha confirmado. Si la otra hace `ROLLBACK`, se leyó algo que nunca existió.
- **Lectura no repetible (*nonrepeatable* o *fuzzy read*):** una transacción
  vuelve a leer una fila que ya había leído y encuentra que cambió o que fue
  borrada, porque otra transacción la modificó y confirmó en el medio.
- **Lectura fantasma (*phantom read*):** una transacción repite una consulta
  con la misma condición y aparecen filas nuevas, porque otra transacción
  insertó registros que cumplen el filtro.

| Nivel ANSI | Lectura sucia | Lectura no repetible | Lectura fantasma |
|:---|:---|:---|:---|
| Read uncommitted | Posible | Posible | Posible |
| Read committed | No | Posible | Posible |
| Repeatable read | No | No | Posible |
| Serializable | No | No | No |

Oracle **nunca permite lecturas sucias**, sin importar el nivel. Por eso no
existe un *read uncommitted* en Oracle.

## 2. Read committed (el predeterminado)

En *read committed* cada **sentencia** ve solo los datos que estaban
confirmados en el momento en que esa sentencia empezó. Oracle logra esto con la
consistencia de lectura: si un dato cambió mientras la consulta corría, la base
reconstruye la versión anterior usando los datos de *undo*. Así, una consulta
nunca ve resultados a medias.

Dos consecuencias importantes:

- **Los lectores no bloquean a los escritores, ni los escritores a los
  lectores.** Un `SELECT` normal no bloquea filas. La excepción es
  `SELECT ... FOR UPDATE`, que sí bloquea las filas que lee.
- **Dos escritores de la misma fila sí se bloquean.** Si una transacción ya
  modificó una fila, la segunda espera a que la primera confirme o deshaga.

Como el punto de consistencia es cada sentencia y no la transacción completa,
una transacción que repite la misma consulta puede obtener resultados distintos
(lecturas no repetibles y fantasmas).

### El problema de la actualización perdida

Este nivel no impide por sí solo una **actualización perdida**: si dos sesiones
leen un saldo, lo calculan en la aplicación y luego lo escriben, la segunda
escritura pisa a la primera aunque la fila haya estado bloqueada mientras se
escribía. Es justo lo que reprodujimos en el Banco Andino. La documentación de
Oracle aclara que manejar este caso es responsabilidad del diseño de la
aplicación. Las estrategias más comunes son:

```sql
-- 1. Bloqueo pesimista: bloquear la fila desde la lectura
SELECT saldo
INTO   v_saldo
FROM   cuenta
WHERE  id_cuenta = :id
FOR UPDATE;

-- 2. Calcular sobre el valor actual dentro del mismo UPDATE
UPDATE cuenta
SET    saldo = saldo - :monto
WHERE  id_cuenta = :id;

-- 3. Bloqueo optimista: comprobar que nada cambió desde la lectura
UPDATE cuenta
SET    saldo = :nuevo_saldo,
       version = version + 1
WHERE  id_cuenta = :id
AND    version = :version_leida;   -- si afecta 0 filas, alguien cambió el dato
```

## 3. Serializable

En *serializable* el punto de consistencia es el **inicio de la transacción**:
todas las sentencias ven los datos tal como estaban confirmados cuando la
transacción empezó, más los cambios hechos por la propia transacción. Por eso no
hay lecturas sucias, ni no repetibles, ni fantasmas.

A cambio, Oracle no deja que una transacción serializable modifique una fila que
otra transacción cambió y confirmó **después** de que la serializable empezó. En
ese caso la sentencia falla con:

```text
ORA-08177: Cannot serialize access for this transaction
```

Ante ese error la aplicación puede confirmar lo que ya hizo, intentar otra cosa
(por ejemplo, volver a un `SAVEPOINT`) o deshacer toda la transacción y
reintentarla. Este nivel tiene sentido cuando las transacciones son cortas y es
poco probable que dos de ellas modifiquen las mismas filas.

## 4. Read-only

El modo *read-only* se parece a *serializable*: todas las consultas ven los
datos como estaban al iniciar la transacción, pero no se permite modificar
datos (salvo para el usuario `SYS`). Como no escribe, nunca recibe `ORA-08177`.

Es útil para **reportes** que deben ser coherentes con un mismo momento, por
ejemplo un informe gerencial que suma saldos de varias tablas. Su riesgo es que,
si el reporte tarda mucho, los datos de *undo* necesarios para reconstruir las
versiones antiguas pueden haberse sobrescrito y aparece el error
*snapshot too old*.

## 5. ¿Cómo se configura?

El nivel se puede definir para la siguiente transacción o para toda la sesión:

```sql
-- Solo para la transacción que empieza
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET TRANSACTION READ ONLY;

-- Para toda la sesión
ALTER SESSION SET ISOLATION_LEVEL = SERIALIZABLE;
ALTER SESSION SET ISOLATION_LEVEL = READ COMMITTED;
```

`SET TRANSACTION` debe ser la primera sentencia de la transacción.

## Comparación general

| Nivel en Oracle | Punto de consistencia | Fenómenos posibles | Ventaja | Costo |
|:---|:---|:---|:---|:---|
| Read committed | Inicio de cada sentencia | No repetible y fantasma | Máxima concurrencia, es el predeterminado | La aplicación debe evitar actualizaciones perdidas |
| Serializable | Inicio de la transacción | Ninguno | Vista estable durante toda la transacción | Puede fallar con `ORA-08177` y exige reintentos |
| Read-only | Inicio de la transacción | Ninguno | Ideal para reportes coherentes | No permite modificar datos; riesgo de *snapshot too old* |

## Conclusiones

El nivel de aislamiento es un acuerdo entre consistencia y concurrencia. Oracle
elige *read committed* por defecto porque ofrece mucha concurrencia sin
lecturas sucias, pero eso no significa que proteja automáticamente cualquier
lógica de negocio: el caso del Banco Andino mostró que una actualización
perdida puede pasar aun con bloqueos de fila, y que la solución está en cómo se
escribe la transacción (`FOR UPDATE`, cálculo sobre el valor actual o control de
versión). *Serializable* y *read-only* sirven cuando se necesita una vista
estable de los datos, siempre que la aplicación esté preparada para reintentar
o para que el reporte no tarde demasiado.

## Fuentes

1. Oracle. *Database Concepts 19c: Data Concurrency and Consistency*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html
2. Oracle Connect. *On Transaction Isolation Levels*.  
   https://blogs.oracle.com/connect/post/on-transaction-isolation-levels
3. AWS. *Oracle to Aurora PostgreSQL Migration Playbook: Oracle transaction model*.  
   https://docs.aws.amazon.com/dms/latest/oracle-to-aurora-postgresql-migration-playbook/chap-oracle-aurora-pg.sql.transactions.html

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database
