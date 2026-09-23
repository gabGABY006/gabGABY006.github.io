---
title: "Tipos de datos PL/SQL"
---

## Título

Script 1: Bloques anónimos y tipos de datos en PL/SQL

## Descripción

Primer script de práctica en PL/SQL, enfocado en la sintaxis básica de un bloque (`DECLARE` / `BEGIN` / `EXCEPTION` / `END`) y en las distintas formas de declarar variables:

- **"Hola mundo"** con `DBMS_OUTPUT.PUT_LINE`, habilitado con `SET SERVEROUTPUT ON`.
- **Variables simples** (`VARCHAR2`, siguiendo la convención de prefijos del curso: `vv` texto, `vn` número, `vd` fecha, `vb` booleano, `vc` char).
- **Atributos de tipo (`%TYPE`)**: declarar una variable con el mismo tipo de una columna real (`EMPLOYEES.FIRST_NAME%TYPE`, etc.), usado junto con `SELECT ... INTO` para traer los datos de un empleado puntual y armar un mensaje concatenado con `TO_CHAR`.
- **`%ROWTYPE`**: declarar una variable que representa una fila completa de la tabla (`EMPLOYEES%ROWTYPE`) en vez de columna por columna, y acceder a sus campos con notación de punto (`vrEmpleado.first_name`).

El objetivo del script es fijar la diferencia entre declarar tipos "a mano", con `%TYPE` (ligado a una columna) y con `%ROWTYPE` (ligado a una fila completa), y dejar sentada la sintaxis mínima de un bloque PL/SQL antes de pasar a procedimientos y funciones reales.

## Enlace para compartir el archivo

<a href="https://drive.google.com/file/d/13iOoyj93HsT5NuPtPqjv7WjsjZ3UzkCK/view?usp=sharing" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver PL/SQL
</a>

## Detalles

- Fecha: 22/09/2026
- Motor / herramienta: SQL Developer