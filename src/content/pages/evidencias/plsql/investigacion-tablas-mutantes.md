---
title: "Investigación: Tablas mutantes (ORA-04091) y triggers compuestos"
---

## Pregunta

¿Por qué Oracle lanza el error ORA-04091 cuando un trigger intenta leer la
tabla que lo disparó, y cómo se evita sin perder la lógica que necesito?

## Respuesta corta

Una tabla es "mutante" mientras una sentencia DML la está modificando. Un
trigger a nivel de fila no puede consultarla ni modificarla en ese momento,
porque vería datos a medias. Se resuelve dejando el trabajo para cuando la
sentencia ya terminó, y la forma más limpia de hacerlo es un **trigger
compuesto** (*compound trigger*).

## Qué es una tabla mutante

Según la documentación de Oracle, una tabla mutante es la que está siendo
modificada por una sentencia DML, y puede serlo también por el efecto de un
`DELETE CASCADE`. La restricción impide que el trigger consulte o modifique esa
tabla mientras la sentencia sigue en curso. Además, esta restricción aplica
solo a los triggers DML simples **a nivel de fila**. Un trigger de sentencia,
o la sección `AFTER STATEMENT` de uno compuesto, no la sufre.

El mensaje que aparece es:

```
ORA-04091: table X is mutating, trigger/function may not see it
```

Un detalle importante: el trigger **se crea sin problemas**. El error aparece
en tiempo de ejecución, cuando un `INSERT`, `UPDATE` o `DELETE` lo dispara.
Por eso es fácil no notarlo hasta que se prueba.

## ¿Por qué existe la restricción?

Mientras la sentencia está a la mitad, algunas filas ya cambiaron y otras no.
Si el trigger pudiera leer la tabla en ese estado, el resultado dependería del
orden en que Oracle procesa las filas y no sería confiable. La restricción
protege la consistencia de lo que el trigger "ve".

## Qué opciones hay para evitarlo

| Opción | Cómo funciona | Comentario |
|:---|:---|:---|
| **Trigger compuesto** | En `AFTER EACH ROW` solo se guardan los datos de cada fila; en `AFTER STATEMENT` se procesan todos juntos | La recomendada desde Oracle 11g. Es la que usamos |
| **Dos triggers y una tabla temporal** | Un trigger por fila guarda en una tabla temporal y otro de sentencia actualiza la tabla con esos datos | Documentada por Oracle, pero requiere más piezas |
| **Reescribir sin leer la tabla** | Usar solo `:NEW` y `:OLD` | La más simple, cuando la lógica lo permite |
| **Trigger a nivel de sentencia** | Quitar `FOR EACH ROW` | Sirve si no se necesitan los valores fila por fila |
| **Transacción autónoma** | El trigger corre en otra transacción | Esquiva el error, pero no ve los cambios sin confirmar de la transacción principal, así que puede calcular mal. No la recomiendo |

## Ejemplo: el caso del taller

En el punto 5.5 del taller necesitábamos que `TRG_DETALLE_TOTAL` recalculara el
total del pedido cada vez que cambiaran sus líneas en `DETALLE_PEDIDO`.

**Primer intento (versión ilustrativa, falla con ORA-04091).** Un trigger por
fila que suma los subtotales leyendo la misma tabla que se está modificando:

```sql
CREATE OR REPLACE TRIGGER TRG_DETALLE_TOTAL
AFTER INSERT OR UPDATE OR DELETE ON DETALLE_PEDIDO
FOR EACH ROW
BEGIN
    UPDATE PEDIDO
    SET    total = (SELECT NVL(SUM(subtotal), 0)
                    FROM   DETALLE_PEDIDO          -- lee la tabla mutante
                    WHERE  id_pedido = NVL(:NEW.id_pedido, :OLD.id_pedido))
    WHERE  id_pedido = NVL(:NEW.id_pedido, :OLD.id_pedido);
END;
/
```

**Solución (la que entregamos, escrita por Lina Patiño, resumida).** Un trigger
compuesto que primero recoge los pedidos afectados y recién al final de la
sentencia hace la suma y la actualización:

```sql
CREATE OR REPLACE TRIGGER TRG_DETALLE_TOTAL
FOR INSERT OR UPDATE OR DELETE ON DETALLE_PEDIDO
COMPOUND TRIGGER
    TYPE t_pedidos IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    V_afectados t_pedidos;

    AFTER EACH ROW IS
    BEGIN
        -- Solo anota qué pedido cambió. No lee la tabla.
        IF INSERTING OR UPDATING THEN V_afectados(:NEW.id_pedido) := 1; END IF;
        IF DELETING  OR UPDATING THEN V_afectados(:OLD.id_pedido) := 1; END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        V_idx PLS_INTEGER;  V_total NUMBER;
    BEGIN
        V_idx := V_afectados.FIRST;
        WHILE V_idx IS NOT NULL LOOP
            SELECT NVL(SUM(subtotal), 0) INTO V_total
            FROM   DETALLE_PEDIDO WHERE id_pedido = V_idx;

            UPDATE PEDIDO SET total = V_total WHERE id_pedido = V_idx;
            V_idx := V_afectados.NEXT(V_idx);
        END LOOP;
    END AFTER STATEMENT;
END TRG_DETALLE_TOTAL;
/
```

La clave es que la lectura de `DETALLE_PEDIDO` ya no ocurre dentro de la
sentencia en curso, sino cuando esta terminó. Además, guardar los pedidos en
una colección evita recalcular el mismo pedido varias veces si la sentencia
tocó varias de sus líneas.

## Conclusiones

El error de tabla mutante no es un fallo del trigger sino una protección de
Oracle, y entender *cuándo* aparece (al ejecutar, no al compilar) me ayudó a
razonar la solución en vez de memorizarla. Lo que me llevo es una regla
práctica: en un trigger por fila solo se trabaja con `:NEW` y `:OLD`, y todo
lo que necesite leer la tabla se pospone para el final de la sentencia. El
trigger compuesto permite hacer eso en un solo objeto, con una colección que
comparte datos entre las dos fases.

## Fuentes

1. Oracle. *Database PL/SQL Language Reference: Trigger Restrictions
   (Mutating-Table Restriction).*
   https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/trigger-restrictions.html
2. Oracle. *Error Help: ORA-04091.*
   https://docs.oracle.com/error-help/db/ora-04091
3. Oracle. *Database PL/SQL Language Reference 11g Release 2: Triggers
   (definición de triggers compuestos).*
   https://docs.oracle.com/cd/E24693_01/appdev.11203/e17126/triggers.htm
4. Oracle Tutorial. *The Mutating Table Error in Oracle and How To Fix It.*
   https://www.oracletutorial.com/plsql-tutorial/mutating-table-error-in-oracle/
5. Callan, S. *The Trigger-Happy DBA, Part 2.* Database Journal.
   https://www.databasejournal.com/oracle/the-trigger-happy-dba-part-2/
6. Shaik. *Mutating table/trigger error and how to resolve it* (ejemplo de la
   comunidad sobre transacciones autónomas).
   https://gist.github.com/shaik2many/4697972