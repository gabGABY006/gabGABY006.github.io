---
title: "Investigación: Manejo de excepciones en PL/SQL"
---

## Introducción

En PL/SQL, una condición de error o de advertencia se llama **excepción**.
Cuando ocurre, la ejecución normal del bloque se detiene y el control pasa a la
sección `EXCEPTION`, donde se puede decidir qué hacer: corregir, registrar el
error, avisarle al usuario o volver a lanzarlo.

Sin manejo de excepciones, habría que revisar si hubo error después de cada
sentencia. Con él, la lógica principal queda limpia y todo el tratamiento de
errores se concentra en un solo lugar. Esta investigación explica los tipos de
excepciones, cómo se lanzan y cómo se propagan, y las buenas prácticas para
manejarlas.

## 1. Estructura de un bloque con excepciones

```sql
DECLARE
    v_nombre employees.first_name%TYPE;
BEGIN
    SELECT first_name
    INTO   v_nombre
    FROM   employees
    WHERE  employee_id = 9999;

    DBMS_OUTPUT.PUT_LINE('Empleado: ' || v_nombre);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No existe un empleado con ese ID');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('La consulta devolvió más de una fila');
END;
/
```

Cada `WHEN` es un manejador. Cuando se ejecuta uno, el bloque termina
normalmente y el control sigue después del `END` del bloque.

## 2. Tipos de excepciones

### Predefinidas

Son errores internos de Oracle que ya tienen un nombre, declarado en el paquete
`STANDARD`. Se lanzan automáticamente y se pueden capturar por su nombre:

| Excepción | Error | Cuándo ocurre |
|:---|:---|:---|
| `NO_DATA_FOUND` | ORA-01403 | Un `SELECT ... INTO` no devuelve filas |
| `TOO_MANY_ROWS` | ORA-01422 | Un `SELECT ... INTO` devuelve más de una fila |
| `ZERO_DIVIDE` | ORA-01476 | Se divide entre cero |
| `DUP_VAL_ON_INDEX` | ORA-00001 | Se viola una restricción única |
| `VALUE_ERROR` | ORA-06502 | Error de conversión, truncamiento o tamaño |
| `INVALID_NUMBER` | ORA-01722 | Un texto no se puede convertir a número en SQL |

### Internas sin nombre

Todo error de Oracle tiene un código, pero la mayoría no tiene nombre. Para
capturar uno específico se le asigna un nombre con `PRAGMA EXCEPTION_INIT`:

```sql
DECLARE
    e_hijos_existentes EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_hijos_existentes, -2292);   -- ORA-02292: registro hijo encontrado
BEGIN
    DELETE FROM departments WHERE department_id = 50;
EXCEPTION
    WHEN e_hijos_existentes THEN
        DBMS_OUTPUT.PUT_LINE('No se puede borrar: el departamento tiene empleados');
END;
/
```

### Definidas por el usuario

Representan reglas del negocio. Se declaran en la sección `DECLARE` y se
lanzan de forma explícita con `RAISE`:

```sql
DECLARE
    e_saldo_insuficiente EXCEPTION;
    v_saldo NUMBER := 100000;
    v_retiro NUMBER := 300000;
BEGIN
    IF v_retiro > v_saldo THEN
        RAISE e_saldo_insuficiente;
    END IF;
EXCEPTION
    WHEN e_saldo_insuficiente THEN
        DBMS_OUTPUT.PUT_LINE('Saldo insuficiente para el retiro');
END;
/
```

## 3. RAISE_APPLICATION_ERROR

Cuando un error de negocio debe llegar hasta quien llamó el procedimiento (otra
capa de PL/SQL o la aplicación), se usa `RAISE_APPLICATION_ERROR`. Detiene el
bloque y devuelve un código y un mensaje propios:

```sql
CREATE OR REPLACE PROCEDURE sp_retirar (
    p_id_cuenta IN NUMBER,
    p_monto     IN NUMBER
) IS
    v_saldo cuenta.saldo%TYPE;
BEGIN
    SELECT saldo INTO v_saldo
    FROM   cuenta
    WHERE  id_cuenta = p_id_cuenta
    FOR UPDATE;

    IF p_monto > v_saldo THEN
        RAISE_APPLICATION_ERROR(-20001, 'Saldo insuficiente en la cuenta ' || p_id_cuenta);
    END IF;

    UPDATE cuenta SET saldo = saldo - p_monto WHERE id_cuenta = p_id_cuenta;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'La cuenta ' || p_id_cuenta || ' no existe');
END;
/
```

- Los códigos propios deben estar entre **-20000 y -20999**, el rango reservado
  para errores de aplicación.
- Solo se puede llamar desde un subprograma almacenado (procedimiento, función,
  *trigger* o paquete).
- Quien llama puede capturar ese código con `PRAGMA EXCEPTION_INIT`.

## 4. Cómo se propagan las excepciones

Si un bloque no tiene un manejador para la excepción que ocurrió, la excepción
**sube** al bloque que lo contiene, y así sucesivamente hasta encontrar un
manejador. Si nadie la maneja, llega al programa que llamó (por ejemplo, SQL
Developer) como un error no controlado.

```sql
BEGIN                                   -- bloque externo
    BEGIN                               -- bloque interno
        RAISE ZERO_DIVIDE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN NULL;   -- no coincide: la excepción sube
    END;
EXCEPTION
    WHEN ZERO_DIVIDE THEN
        DBMS_OUTPUT.PUT_LINE('Capturada en el bloque externo');
END;
/
```

Dentro de un manejador también se puede usar `RAISE;` sin nombre para volver a
lanzar la misma excepción después de registrarla, de modo que el error no se
pierda.

## 5. SQLCODE, SQLERRM y el rastro del error

Dentro de un manejador hay funciones que describen el error ocurrido:

- **`SQLCODE`**: el número del error (por ejemplo, `-1476`).
- **`SQLERRM`**: el mensaje del error.
- **`DBMS_UTILITY.FORMAT_ERROR_BACKTRACE`**: la línea donde se originó el error,
  muy útil para depurar.

```sql
EXCEPTION
    WHEN OTHERS THEN
        sp_registrar_error('SP_FACTURAR', SQLCODE || ' ' || SQLERRM ||
                           ' ' || DBMS_UTILITY.FORMAT_ERROR_BACKTRACE);
        RAISE;   -- se registra y se vuelve a lanzar
END;
```

## 6. Buenas prácticas

1. **Capturar por nombre** las excepciones esperadas en lugar de usar solo
   `WHEN OTHERS`.
2. **No "tragarse" errores:** un `WHEN OTHERS THEN NULL;` oculta problemas
   reales. Si se usa `WHEN OTHERS`, debería registrar el error y volver a
   lanzarlo con `RAISE`.
3. **Usar códigos únicos** de `RAISE_APPLICATION_ERROR` para cada situación,
   para que quien llama pueda distinguirlas.
4. **Registrar errores con una transacción autónoma**, para que el registro no
   se pierda si la transacción principal hace `ROLLBACK`.

## Comparación general

| Tipo | ¿Tiene nombre? | ¿Cómo se lanza? | Ejemplo |
|:---|:---|:---|:---|
| Predefinida | Sí, en `STANDARD` | Automáticamente | `NO_DATA_FOUND` |
| Interna sin nombre | Se le da con `PRAGMA EXCEPTION_INIT` | Automáticamente | ORA-02292 |
| Definida por el usuario | Se declara | `RAISE` | `e_saldo_insuficiente` |
| Error de aplicación | Código entre -20000 y -20999 | `RAISE_APPLICATION_ERROR` | `-20001` |

## Conclusiones

Un buen manejo de excepciones hace que la base de datos proteja sus reglas y
explique claramente por qué rechaza una operación. En el taller de inventario y
ventas aplicamos varias de estas ideas: `DUP_VAL_ON_INDEX` para convertir un
código duplicado en un error de negocio, `RAISE_APPLICATION_ERROR` con códigos
propios para cada rechazo, y una tabla `LOG_ERRORES` alimentada por un
procedimiento con `PRAGMA AUTONOMOUS_TRANSACTION`. Esa experiencia también
mostró la tercera buena práctica: repetir un mismo código para dos errores
distintos hace que quien llama no pueda distinguirlos.

## Fuentes

1. Oracle. *Database PL/SQL Language Reference 21c: PL/SQL Error Handling*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/plsql-error-handling.html
2. Oracle. *Predefined Exceptions*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/23/lnpls/predefined-exceptions.html
3. Oracle. *Raising Exceptions Explicitly*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/raising-exceptions-explicitly.html
4. Oracle. *EXCEPTION_INIT Pragma*.  
   https://docs.oracle.com/en/database/oracle/oracle-database/21/lnpls/EXCEPTION_INIT-pragma.html
5. Oracle Connect (Steven Feuerstein). *Error Management and Exception Handling in PL/SQL*.  
   https://blogs.oracle.com/connect/post/error-management

## Detalles

- Fecha: noviembre de 2026
- Motor / herramienta: Oracle Database, PL/SQL
