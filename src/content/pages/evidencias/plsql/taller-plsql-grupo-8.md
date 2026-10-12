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

## Qué hice y por qué

- **Procedimientos:** `SP_REGISTRAR_PRODUCTO`, `SP_AJUSTAR_STOCK` (entradas y
  salidas con saldo final) y `SP_CREAR_PEDIDO`. Corregimos primero
  `FN_CUPO_DISPONIBLE` porque `SP_CREAR_PEDIDO` depende de ella para validar
  el crédito.
- **Funciones:** `FN_CUPO_DISPONIBLE` devuelve 0 si el cliente está inactivo o
  no existe, en vez de lanzar error. `FN_CALCULAR_DESCUENTO` combina un
  porcentaje base por monto con un adicional para clientes sin saldo pendiente.
- **Cursores:** explícito, parametrizado, `FOR UPDATE ... WAIT 5` (con manejo
  de `ORA-30006`), cursor de referencia (`SYS_REFCURSOR`) y
  `BULK COLLECT` + `FORALL`.
- **Excepciones:** errores propios con `RAISE_APPLICATION_ERROR` (-20010 a
  -20012) y una tabla `LOG_ERRORES` alimentada por `SP_REGISTRAR_ERROR`.
- **Disparadores:** autoasignación de ID, auditoría de precios, validación de
  margen mínimo, descuento de stock al despachar, recálculo del total del
  pedido y un `INSTEAD OF` sobre la vista `V_STOCK_CONSOLIDADO`.
- **Caso integrador:** el paquete `PKG_VENTAS` con `SP_FACTURAR_PEDIDO`, que
  usa un `SAVEPOINT` para deshacer todo si algo falla y registra el error.

## Código clave

Pega aquí 1 o 2 fragmentos cortos, por ejemplo el trigger de margen mínimo o
el `FOR UPDATE ... WHERE CURRENT OF`. El script completo está en
[GitHub](https://github.com/gabgaby006/bases-de-datos-2/blob/main/taller_plsql_grupo_8.sql).

## Resultados

- Un ajuste de stock de +20 y -5 dejó el saldo de la bodega en 140 y luego
  135, con sus dos movimientos registrados.
- El descuento del cliente 501 con un pedido de 2.500.000 dio 200.000 (8 %),
  y el del cliente 503 con 1.000.000 dio 70.000 (7 %).
- En el ajuste de precios (-22 %) se actualizaron 3 productos y uno se omitió
  porque quedaba por debajo del margen mínimo (29.640 frente a 30.000).
- El trigger de margen rechazó un precio de 30.000 con el error ORA-20020.
- Al facturar el pedido 6, quedó `CONFIRMADO` por 90.000 y el saldo del
  cliente 501 pasó de 1.250.000 a 1.340.000.

(Aquí puedes poner las capturas del PDF.)

## Mi parte

Escribe qué puntos desarrollaste tú.

## Conclusiones

Escribe con tus palabras qué aprendiste. Algunas preguntas que te pueden
ayudar:
- ¿Qué diferencia viste entre validar en un procedimiento y en un trigger?
- ¿Qué fue lo más difícil: cursores, triggers o el paquete?
- ¿Qué harías distinto la próxima vez?

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