---
title: "Investigación: Procesamiento masivo con BULK COLLECT y FORALL"
---

## Introducción

Casi todo programa PL/SQL mezcla dos tipos de instrucciones: las de PL/SQL
(variables, `IF`, ciclos) y las de SQL (`SELECT`, `INSERT`, `UPDATE`,
`DELETE`). Oracle ejecuta cada tipo en un motor distinto, así que cada vez que
un bloque PL/SQL ejecuta una sentencia SQL, el control pasa del motor PL/SQL al
motor SQL y luego regresa. Ese paso se llama **cambio de contexto** (*context
switch*) y cada uno tiene un costo.

Si un ciclo actualiza 10.000 filas una por una, hay 10.000 cambios de contexto.
Las herramientas de procesamiento masivo de PL/SQL, `BULK COLLECT` y `FORALL`,
existen para agrupar ese trabajo y reducir los cambios de contexto a unos
pocos. Esta investigación explica cómo funcionan, cómo se manejan sus errores y
cuándo conviene usarlas.

## 1. El problema: procesar fila por fila

Este bloque sube el salario de los empleados de un departamento. Funciona, pero
por cada fila que recorre el cursor hace un `UPDATE` aparte:

```sql
BEGIN
    FOR r IN (SELECT employee_id FROM employees WHERE department_id = 50) LOOP
        UPDATE employees
        SET    salary = salary * 1.10
        WHERE  employee_id = r.employee_id;   -- un cambio de contexto por fila
    END LOOP;
END;
/
```

Por eso a este estilo se le llama en broma *slow-by-slow* (en vez de
*row-by-row*). Si la lógica es así de simple, la mejor solución ni siquiera es
PL/SQL: un único `UPDATE ... WHERE department_id = 50` hace todo el trabajo en
el motor SQL. El procesamiento masivo sirve cuando sí se necesita lógica
PL/SQL entre la lectura y la escritura.

## 2. BULK COLLECT: leer muchas filas de una vez

`BULK COLLECT` trae el resultado de una consulta a una o varias
**colecciones** con un solo cambio de contexto, en vez de leer fila por fila.

```sql
DECLARE
    TYPE t_ids IS TABLE OF employees.employee_id%TYPE;
    TYPE t_sal IS TABLE OF employees.salary%TYPE;
    v_ids t_ids;
    v_sal t_sal;
BEGIN
    SELECT employee_id, salary
    BULK COLLECT INTO v_ids, v_sal
    FROM   employees
    WHERE  department_id = 50;

    DBMS_OUTPUT.PUT_LINE('Filas leídas: ' || v_ids.COUNT);
END;
/
```

### Cuidado con la memoria: la cláusula LIMIT

Las colecciones viven en la memoria de la sesión (PGA). Si la consulta
devuelve millones de filas, traerlas todas de una vez puede agotar esa memoria.
Para tablas grandes se usa un cursor explícito con `LIMIT` y se procesa por
lotes:

```sql
DECLARE
    CURSOR c_emp IS
        SELECT employee_id FROM employees;
    TYPE t_ids IS TABLE OF employees.employee_id%TYPE;
    v_ids t_ids;
BEGIN
    OPEN c_emp;
    LOOP
        FETCH c_emp BULK COLLECT INTO v_ids LIMIT 500;   -- lotes de 500 filas
        EXIT WHEN v_ids.COUNT = 0;
        -- ... procesar el lote ...
    END LOOP;
    CLOSE c_emp;
END;
/
```

Un detalle que causa errores: con `LIMIT`, la condición de salida debe revisar
si la colección quedó vacía (`v_ids.COUNT = 0`). Si se usa
`EXIT WHEN c_emp%NOTFOUND` justo después del `FETCH`, el último lote incompleto
se puede quedar sin procesar.

## 3. FORALL: enviar muchas sentencias DML de una vez

`FORALL` no es un ciclo, aunque se parezca. Toma una colección y le envía al
motor SQL, en un solo lote, la misma sentencia DML repetida con cada valor de la
colección.

```sql
DECLARE
    TYPE t_ids IS TABLE OF employees.employee_id%TYPE;
    v_ids t_ids;
BEGIN
    SELECT employee_id
    BULK COLLECT INTO v_ids
    FROM   employees
    WHERE  department_id = 50;

    FORALL i IN 1 .. v_ids.COUNT
        UPDATE employees
        SET    salary = salary * 1.10
        WHERE  employee_id = v_ids(i);

    DBMS_OUTPUT.PUT_LINE('Filas actualizadas: ' || SQL%ROWCOUNT);
END;
/
```

Reglas que hay que tener en cuenta:

- Un `FORALL` puede contener **una sola** sentencia DML. Un `FOR LOOP` puede
  tener varias.
- Las sentencias del lote solo pueden cambiar en los valores que toman de la
  colección (por ejemplo, en el `VALUES` o en el `WHERE`).
- Si la colección tiene huecos (porque se borraron elementos), se usa
  `INDICES OF`; para procesar solo un subconjunto se puede usar `VALUES OF`
  con una colección de índices.
- `SQL%BULK_ROWCOUNT(i)` indica cuántas filas afectó la sentencia número `i`,
  y `SQL%ROWCOUNT` da el total.

En el ejemplo de la documentación de Oracle, insertar 50.000 filas tomó cerca de
6 segundos con un `FOR LOOP` y menos de una décima de segundo con `FORALL`
(los tiempos varían de una ejecución a otra).

## 4. Manejo de errores con SAVE EXCEPTIONS

Por defecto, si una de las sentencias del `FORALL` falla, el `FORALL` se
detiene y se deshacen los cambios que ese mismo `FORALL` ya había hecho. Con
`SAVE EXCEPTIONS`, en cambio, Oracle sigue con las demás filas, guarda la
información de cada error y al final lanza una sola excepción, `ORA-24381`.
Los detalles quedan en `SQL%BULK_EXCEPTIONS`:

```sql
DECLARE
    e_errores_dml EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_errores_dml, -24381);
    TYPE t_ids IS TABLE OF producto.id_producto%TYPE;
    v_ids t_ids := t_ids(1001, 1002, 1003);
BEGIN
    FORALL i IN 1 .. v_ids.COUNT SAVE EXCEPTIONS
        UPDATE producto
        SET    precio = precio * 0.78
        WHERE  id_producto = v_ids(i);
EXCEPTION
    WHEN e_errores_dml THEN
        FOR j IN 1 .. SQL%BULK_EXCEPTIONS.COUNT LOOP
            DBMS_OUTPUT.PUT_LINE(
                'Fila ' || SQL%BULK_EXCEPTIONS(j).ERROR_INDEX ||
                ': ' || SQLERRM(-SQL%BULK_EXCEPTIONS(j).ERROR_CODE));
        END LOOP;
END;
/
```

Este patrón es útil, por ejemplo, para un ajuste masivo de precios en el que un
*trigger* de margen mínimo rechaza algunos productos: los que sí cumplen se
actualizan y los rechazados quedan reportados.

## Comparación general

| Enfoque | Cambios de contexto | Cuándo usarlo |
|:---|:---|:---|
| Una sola sentencia SQL | Uno | Cuando la lógica se puede escribir completa en SQL |
| `FOR LOOP` fila por fila | Uno por fila | Pocas filas, o varias sentencias DML distintas por fila |
| `BULK COLLECT` | Uno por lote | Leer muchas filas para procesarlas en PL/SQL |
| `FORALL` | Uno por lote | Ejecutar la misma DML con muchos valores |
| `BULK COLLECT ... LIMIT` + `FORALL` | Uno por lote | Tablas grandes sin agotar la memoria |

## Conclusiones

`BULK COLLECT` y `FORALL` atacan el mismo problema desde dos lados: el primero
reduce los cambios de contexto al leer y el segundo al escribir. Usados juntos,
con `LIMIT` para controlar la memoria y `SAVE EXCEPTIONS` para no perder todo el
lote por una fila con error, permiten procesar grandes volúmenes de datos con
lógica PL/SQL sin pagar el costo de ir fila por fila. En el taller de inventario
y ventas usamos `BULK COLLECT` con `FORALL` en la parte de cursores, y esta
investigación explica por qué ese enfoque es más eficiente. Aun así, la primera
pregunta siempre debería ser si el trabajo se puede hacer con una sola
sentencia SQL.

## Fuentes

1. Oracle. *Database PL/SQL Language Reference 19c: Bulk SQL and Bulk Binding*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/bulk-sql-and-bulk-binding.html
2. Oracle Connect (Steven Feuerstein). *Bulk Processing with BULK COLLECT and FORALL*.  
   https://blogs.oracle.com/connect/post/bulk-processing-with-bulk-collect-and-forall
3. Oracle Connect (Steven Feuerstein). *Solving the Row-by-Row Problem*.  
   https://blogs.oracle.com/connect/post/solving-the-row-by-row-problem

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database, PL/SQL
