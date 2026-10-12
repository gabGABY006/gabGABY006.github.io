---
title: "Taller PL/SQL: Inventario y Ventas (Grupo 8)"
---

## Contexto

Taller integrador de PL/SQL de Bases de Datos 2 sobre un sistema de
inventario y ventas (productos, bodegas, clientes con cupo de crédito y
pedidos). Trabajo en equipo de 3 integrantes, entregado el 3 de octubre de 2026.

## Objetivo

Pasar de bloques sueltos a una lógica de negocio completa dentro de la base de
datos: procedimientos, funciones, cursores, manejo de errores, disparadores y
un paquete que integra todo.

## Qué cubrió el taller

- **Procedimientos:** `SP_REGISTRAR_PRODUCTO`, `SP_AJUSTAR_STOCK` (entradas y
  salidas con saldo final) y `SP_CREAR_PEDIDO`.
- **Funciones:** `FN_STOCK_DISPONIBLE`, `FN_CUPO_DISPONIBLE` y
  `FN_CALCULAR_DESCUENTO`.
- **Cursores:** explícito, parametrizado, `FOR UPDATE ... WAIT 5` (con manejo
  de `ORA-30006`), cursor de referencia (`SYS_REFCURSOR`) y
  `BULK COLLECT` + `FORALL`.
- **Excepciones:** errores propios con `RAISE_APPLICATION_ERROR` y una tabla
  `LOG_ERRORES` alimentada por `SP_REGISTRAR_ERROR`.
- **Disparadores:** autoasignación de ID, auditoría de precios, validación de
  margen mínimo, descuento de stock al despachar, recálculo del total del
  pedido y un `INSTEAD OF` sobre la vista `V_STOCK_CONSOLIDADO`.
- **Caso integrador:** el paquete `PKG_VENTAS` con `SP_FACTURAR_PEDIDO`, que
  usa un `SAVEPOINT` para deshacer todo si algo falla y registra el error.

## Mi parte

Me tocaron los procedimientos (1.1, 1.2, 1.3), las funciones (2.1 a 2.4) y el
registro de errores (4.5). Estas fueron mis decisiones principales:

- **`SP_REGISTRAR_PRODUCTO`:** valido que el precio supere el costo antes del
  `INSERT`, consulto la categoría de forma explícita para distinguir "no
  existe" de otros errores, y uso `DUP_VAL_ON_INDEX` para convertir un código
  duplicado en un error de negocio, aprovechando que `CODIGO` es único. El
  identificador sale de `SEQ_PRODUCTO` y no de un `MAX(id)`.
- **`SP_AJUSTAR_STOCK`:** leo la existencia con `FOR UPDATE` para bloquear la
  fila mientras calculo el saldo, así dos sesiones no pisan el mismo valor. Una
  `ENTRADA` puede crear la combinación bodega-producto que falta, una `SALIDA`
  la rechaza, y la `SALIDA` se valida antes de restar para no dejar la
  existencia en negativo. El movimiento se registra en la misma transacción.
- **`SP_CREAR_PEDIDO`:** reutiliza `FN_CUPO_DISPONIBLE` en vez de repetir la
  fórmula del crédito, para tener una sola fuente de verdad. Cada rechazo tiene
  su propio código de error (cliente inexistente, inactivo o sin cupo). Por
  eso tuvimos que terminar primero el punto 2.2.
- **`FN_STOCK_DISPONIBLE`:** una sola función con `SUM` y `NVL` cubre bodega
  específica y consolidado (`p_id_bodega IS NULL OR ...`). Un producto
  inexistente devuelve 0 en vez de lanzar una excepción.
- **`FN_CUPO_DISPONIBLE`:** devuelve cupo menos saldo con `GREATEST(..., 0)`
  para que nunca sea negativo, y 0 si el cliente está inactivo o no existe.
  Eso la hace segura de usar dentro de consultas.
- **`FN_CALCULAR_DESCUENTO`:** calcula primero el porcentaje base por monto,
  suma el 2 % si el cliente no tiene saldo, aplica el tope del 10 % con
  `LEAST` y devuelve el **valor en pesos**, no el porcentaje.
- **2.4:** una consulta que lista los clientes activos con su cupo usando la
  función. Una función de usuario puede llamarse desde SQL siempre que no
  modifique datos ni controle transacciones.
- **`SP_REGISTRAR_ERROR`:** usa `PRAGMA AUTONOMOUS_TRANSACTION` para que el
  registro del error se confirme aunque la transacción principal termine en
  `ROLLBACK`. Ese mismo aislamiento también puede ocultar información: el log
  puede describir un intento fallido que después se manejó sin problema.

## Código clave

Dos fragmentos de mi parte. El script completo está en
[GitHub](https://github.com/gabGABY006/bases-de-datos-2/blob/main/TALLER_PLSQL_GRUPO_8.sql).

**Bloqueo y validación de la salida en `SP_AJUSTAR_STOCK` (resumido):**

```sql
SELECT cantidad
INTO V_cantidad
FROM EXISTENCIA
WHERE id_bodega = p_id_bodega
  AND id_producto = p_id_producto
FOR UPDATE;   -- bloquea la fila mientras se calcula el nuevo saldo

IF VV_tipo = 'SALIDA' THEN
    IF V_cantidad < p_cantidad THEN
        RAISE_APPLICATION_ERROR(-20006,
            'La SALIDA supera la existencia disponible');
    END IF;
    V_cantidad := V_cantidad - p_cantidad;
END IF;
```

**Transacción autónoma en `SP_REGISTRAR_ERROR` (resumido):**

```sql
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_ERROR (
    p_origen  IN VARCHAR2,
    p_detalle IN VARCHAR2 DEFAULT NULL
) IS
    PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    INSERT INTO LOG_ERRORES (...) VALUES (...);
    COMMIT;   -- confirma solo el log, no el trabajo del llamador
END;
```

## Resultados

- Un producto de prueba (`PRU-100`) se creó con el ID 1000.
- Un ajuste de stock de +20 y -5 dejó el saldo de la bodega en 140 y luego
  135, con sus dos movimientos registrados.
- El stock del producto 1001 dio 135 en la bodega 1 y 175 consolidado, y un
  producto inexistente devolvió 0 sin error.
- El cupo disponible del cliente 501 fue 6.750.000. El cliente inactivo 506 y
  el inexistente 9999 devolvieron 0.
- El descuento del cliente 501 con un pedido de 2.500.000 dio 200.000 (8 %),
  y el del cliente 503 con 1.000.000 dio 70.000 (7 %).
- Se creó un pedido en `BORRADOR` para el cliente 501 (pedido 8).
- Al provocar una división por cero, el error `ORA-01476` quedó guardado en
  `LOG_ERRORES`.
- En el ajuste de precios (-22 %) se actualizaron 3 productos y uno se omitió
  porque quedaba por debajo del margen mínimo (29.640 frente a 30.000).
- El trigger de margen rechazó un precio de 30.000 con el error ORA-20020.
- Al facturar el pedido 6, quedó `CONFIRMADO` por 90.000 y el saldo del
  cliente 501 pasó de 1.250.000 a 1.340.000.

(Aquí puedes poner las capturas del PDF.)

## Conclusiones

Lo que más me llevo es que la lógica de negocio se puede proteger dentro de la
base de datos y no solo en la aplicación. Reutilizar `FN_CUPO_DISPONIBLE` en
`SP_CREAR_PEDIDO` me mostró el valor de tener una única fuente de verdad para
una regla. Y bloquear con `FOR UPDATE` antes de calcular un saldo es lo que
evita que dos operaciones simultáneas se pisen.

Si lo repitiera, centralizaría los códigos de error del taller. Por ejemplo,
`-20010` aparece tanto para "cliente no existe" como para "pedido no existe",
y quien consuma los procedimientos no podría distinguirlos solo por el código.

## Detalles

- Fecha: 03/10/2026
- Motor / herramienta: Oracle, SQL Developer
- Modalidad: trabajo en equipo (3 integrantes)

<a href="https://github.com/gabGABY006/bases-de-datos-2/blob/main/TALLER_PLSQL_GRUPO_8.sql" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver código en GitHub
</a>

<a href="https://github.com/gabGABY006/bases-de-datos-2/blob/main/TALLER_PLSQL_GRUPO_8.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver documento de evidencias
</a>