---
title: "Investigación: Paquetes en PL/SQL"
---

## Introducción

A medida que una base de datos crece, aparecen decenas de procedimientos y
funciones sueltos. Un **paquete** es un objeto del esquema que agrupa tipos,
variables, cursores, excepciones y subprogramas que están relacionados
lógicamente, por ejemplo todo lo que tiene que ver con ventas.

Los paquetes son la forma más ordenada de construir lógica de negocio en
PL/SQL: separan lo que se ofrece hacia afuera de cómo está implementado, y
permiten cambiar la implementación sin afectar a quien la usa. Esta
investigación explica sus partes, sus ventajas y algunos detalles que conviene
conocer, como el estado del paquete.

## 1. Especificación y cuerpo

Un paquete tiene dos partes:

- **La especificación (*spec*)** es la interfaz: declara los elementos
  **públicos** que se pueden usar desde fuera del paquete.
- **El cuerpo (*body*)** contiene la implementación de los subprogramas y
  cursores declarados en la especificación, y puede tener elementos
  **privados** que solo se usan adentro.

Si la especificación declara cursores o subprogramas, el cuerpo es obligatorio.
Si solo declara tipos, constantes, variables o excepciones, el cuerpo es
opcional.

```sql
-- Especificación: lo que ve el resto del sistema
CREATE OR REPLACE PACKAGE pkg_cuentas AS
    e_saldo_insuficiente EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_saldo_insuficiente, -20001);

    PROCEDURE sp_transferir (p_origen IN NUMBER, p_destino IN NUMBER, p_monto IN NUMBER);
    FUNCTION  fn_saldo      (p_id_cuenta IN NUMBER) RETURN NUMBER;
END pkg_cuentas;
/

-- Cuerpo: cómo se hace
CREATE OR REPLACE PACKAGE BODY pkg_cuentas AS

    -- Privado: no aparece en la especificación
    PROCEDURE validar_monto (p_monto IN NUMBER) IS
    BEGIN
        IF p_monto <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'El monto debe ser positivo');
        END IF;
    END validar_monto;

    FUNCTION fn_saldo (p_id_cuenta IN NUMBER) RETURN NUMBER IS
        v_saldo cuenta.saldo%TYPE;
    BEGIN
        SELECT saldo INTO v_saldo FROM cuenta WHERE id_cuenta = p_id_cuenta;
        RETURN v_saldo;
    END fn_saldo;

    PROCEDURE sp_transferir (p_origen IN NUMBER, p_destino IN NUMBER, p_monto IN NUMBER) IS
    BEGIN
        validar_monto(p_monto);
        -- ... bloquear cuentas en orden fijo, debitar, acreditar ...
    END sp_transferir;

END pkg_cuentas;
/
```

Desde afuera se llama con la notación `paquete.elemento`:

```sql
BEGIN
    pkg_cuentas.sp_transferir(101, 202, 300000);
    DBMS_OUTPUT.PUT_LINE(pkg_cuentas.fn_saldo(101));
END;
/
```

## 2. Ventajas de usar paquetes

- **Modularidad:** todo lo relacionado con un tema queda en un solo lugar, con
  una interfaz clara.
- **Ocultamiento de información:** los detalles del cuerpo no se ven desde
  afuera. Por ejemplo, `validar_monto` no se puede llamar directamente.
- **Cambios sin efecto dominó:** se puede modificar o recompilar el cuerpo sin
  cambiar la especificación, y los programas que usan el paquete no necesitan
  recompilarse. Si cambia la especificación, en cambio, sí hay que recompilar a
  quienes dependen de ella.
- **Rendimiento:** la primera vez que una sesión usa algo del paquete, Oracle lo
  carga completo en memoria, así que las llamadas siguientes a otros
  subprogramas del paquete no requieren cargarlo de nuevo.
- **Sobrecarga (*overloading*):** varios subprogramas del paquete pueden tener
  el mismo nombre si sus parámetros son distintos.

```sql
-- Dos versiones de la misma función en la especificación
FUNCTION fn_buscar_cliente (p_id     IN NUMBER)   RETURN cliente%ROWTYPE;
FUNCTION fn_buscar_cliente (p_correo IN VARCHAR2) RETURN cliente%ROWTYPE;
```

## 3. El estado del paquete

Las variables, constantes y cursores declarados en un paquete (en la
especificación o en el cuerpo) forman su **estado**. Cada sesión que usa el
paquete tiene su propia copia de ese estado, y por defecto dura toda la sesión.

Esto permite, por ejemplo, guardar un contador o una configuración en memoria
durante la sesión. Pero tiene una consecuencia importante: si el cuerpo de un
paquete que guarda estado se recompila mientras una sesión lo está usando, la
siguiente llamada desde esa sesión falla con el error **ORA-04068** y el estado
se pierde. Por eso no conviene recompilar paquetes con estado en producción
mientras hay usuarios conectados.

Un paquete marcado con `PRAGMA SERIALLY_REUSABLE` no conserva su estado entre
llamadas al servidor, lo que ahorra memoria cuando el estado solo se necesita
durante una llamada.

## 4. Sección de inicialización

El cuerpo puede terminar con un bloque `BEGIN` que se ejecuta **una sola vez
por sesión**, la primera vez que se usa el paquete. Sirve para cargar valores
iniciales:

```sql
CREATE OR REPLACE PACKAGE BODY pkg_config AS
    g_iva NUMBER;
    FUNCTION fn_iva RETURN NUMBER IS BEGIN RETURN g_iva; END;
BEGIN
    SELECT valor INTO g_iva FROM parametro WHERE nombre = 'IVA';   -- se ejecuta una vez
END pkg_config;
/
```

## Comparación general

| Aspecto | Procedimientos y funciones sueltos | Paquete |
|:---|:---|:---|
| Organización | Objetos independientes | Agrupados por tema |
| Elementos privados | No existen | Sí, en el cuerpo |
| Cambiar la implementación | Puede invalidar a quienes lo usan | Recompilar el cuerpo no afecta a quienes usan la especificación |
| Variables que duran la sesión | No | Sí (estado del paquete) |
| Sobrecarga de nombres | No | Sí |

## Conclusiones

Los paquetes son la manera profesional de organizar la lógica en PL/SQL: una
especificación pequeña y clara hacia afuera, y la complejidad escondida en el
cuerpo. En el taller de inventario y ventas, el caso integrador fue justamente
el paquete `PKG_VENTAS` con `SP_FACTURAR_PEDIDO`, que reunía en un solo lugar la
lógica de facturación, el uso de `SAVEPOINT` y el registro de errores. Entender
el estado del paquete y el error ORA-04068 también ayuda a evitar sorpresas
cuando se actualiza un paquete en un sistema que está en uso.

## Fuentes

1. Oracle. *Database PL/SQL Language Reference: PL/SQL Packages*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/23/lnpls/plsql-packages.html
2. Oracle. *What is a Package?*  
   https://docs.oracle.com/en/database/oracle/oracle-database/23/lnpls/what-is-package.html
3. Oracle. *Package State*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/package-state.html

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database, PL/SQL
