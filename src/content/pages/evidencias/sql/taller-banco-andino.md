---
title: "Taller Integrador — Transacciones, Concurrencia, Índices y SQL Avanzado"
---

## Título

Taller integrador · Banco Andino

## Descripción

Taller integrador de Bases de Datos 2 sobre un caso bancario simulado (Banco Andino), enfocado en diagnosticar y corregir problemas reales de concurrencia, integridad transaccional y rendimiento en Oracle.

Incluyó cuatro frentes de trabajo:

- **Concurrencia y bloqueos**: reproducción de una actualización perdida (lost update) entre dos conexiones simultáneas, y su corrección con bloqueo pesimista (`SELECT ... FOR UPDATE`) y bloqueo optimista (columna de versión). Reparto de una cola de tareas con `FOR UPDATE SKIP LOCKED`, y provocación/corrección de un interbloqueo real (`ORA-00060`) entre transferencias cruzadas.
- **Índices y optimización de consultas**: uso de `EXPLAIN PLAN` y `DBMS_XPLAN` para comparar planes de ejecución antes/después de crear índices compuestos, índices basados en función, y análisis de selectividad y *clustering factor* para justificar cuándo un índice sí se usa y cuándo no.
- **SQL avanzado**: funciones de ventana (`RANK`, `DENSE_RANK`, `ROW_NUMBER`, `LAG`), series de tiempo con acumulados y promedios móviles, CTEs recursivas para resolver jerarquías de catálogo, `MERGE` para conciliación de ajustes, y `PIVOT`/`LISTAGG` para reportes.
- **Reto integrador**: diagnóstico de cuatro defectos reales (concurrencia, transaccionalidad, trazabilidad y rendimiento) en una secuencia bancaria defectuosa, y su reescritura completa aplicando bloqueo en orden determinista, atomicidad, verificación de filas afectadas y optimización de la consulta gerencial mediante reescritura de predicados sargables.

<div class="evidence-callout">
<strong>¿Por qué dos retiros dejaron un saldo incorrecto?</strong>
<p>Las dos sesiones leyeron un saldo de $1.000.000. Al retirar $300.000 y $200.000 debían quedar $500.000, pero la última escritura dejó $800.000. La fila estuvo bloqueada durante la escritura y, aun así, se perdió un retiro: la segunda sesión había calculado su saldo con un dato anterior.</p>
<p>En el script, compara las dos conexiones con la secuencia corregida. Busca <code>FOR UPDATE</code> y observa dónde se confirma el débito junto con el crédito.</p>
</div>

## Informe final

<iframe title="Informe final" src="/bases-2/banco-andino/informe.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Guía del taller

<iframe title="Guía del taller" src="/bases-2/banco-andino/guia.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

## Capturas del informe

<div class="evidence-gallery">
<figure><a href="/bases-2/banco-andino/capturas/image1.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image1.png" loading="lazy" alt="Captura 1 del informe" /></a><figcaption>Captura 1</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image2.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image2.png" loading="lazy" alt="Captura 2 del informe" /></a><figcaption>Captura 2</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image3.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image3.png" loading="lazy" alt="Captura 3 del informe" /></a><figcaption>Captura 3</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image4.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image4.png" loading="lazy" alt="Captura 4 del informe" /></a><figcaption>Captura 4</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image5.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image5.png" loading="lazy" alt="Captura 5 del informe" /></a><figcaption>Captura 5</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image6.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image6.png" loading="lazy" alt="Captura 6 del informe" /></a><figcaption>Captura 6</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image7.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image7.png" loading="lazy" alt="Captura 7 del informe" /></a><figcaption>Captura 7</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image8.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image8.png" loading="lazy" alt="Captura 8 del informe" /></a><figcaption>Captura 8</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image9.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image9.png" loading="lazy" alt="Captura 9 del informe" /></a><figcaption>Captura 9</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image10.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image10.png" loading="lazy" alt="Captura 10 del informe" /></a><figcaption>Captura 10</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image11.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image11.png" loading="lazy" alt="Captura 11 del informe" /></a><figcaption>Captura 11</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image12.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image12.png" loading="lazy" alt="Captura 12 del informe" /></a><figcaption>Captura 12</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image13.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image13.png" loading="lazy" alt="Captura 13 del informe" /></a><figcaption>Captura 13</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image14.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image14.png" loading="lazy" alt="Captura 14 del informe" /></a><figcaption>Captura 14</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image15.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image15.png" loading="lazy" alt="Captura 15 del informe" /></a><figcaption>Captura 15</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image16.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image16.png" loading="lazy" alt="Captura 16 del informe" /></a><figcaption>Captura 16</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image17.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image17.png" loading="lazy" alt="Captura 17 del informe" /></a><figcaption>Captura 17</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image18.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image18.png" loading="lazy" alt="Captura 18 del informe" /></a><figcaption>Captura 18</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image19.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image19.png" loading="lazy" alt="Captura 19 del informe" /></a><figcaption>Captura 19</figcaption></figure>
<figure><a href="/bases-2/banco-andino/capturas/image20.png" target="_blank" rel="noopener noreferrer"><img src="/bases-2/banco-andino/capturas/image20.png" loading="lazy" alt="Captura 20 del informe" /></a><figcaption>Captura 20</figcaption></figure>
</div>

## Script SQL del reto corregido

<div class="evidence-code">

```sql
-- =====================================================================
-- Bases de Datos 2 · Taller integrador — Banco Andino
-- Archivo: 04_reto_corregido.sql
-- Integrantes: Julián · Gabriela · Lina
-- =====================================================================

-- =====================================================================
-- 1. Reproducción del defecto de CONCURRENCIA
-- =====================================================================

-- Dejar la cuenta en un valor conocido (ejecutar una sola vez antes de abrir la segunda conexión)
UPDATE cuenta SET saldo = 1000000, version = 0 WHERE id_cuenta = 1001;
COMMIT;

-- [CONEXIÓN A]
SELECT saldo FROM cuenta WHERE id_cuenta = 1001;         -- 1.000.000
UPDATE cuenta SET saldo = 700000 WHERE id_cuenta = 1001;  -- No confirmar todavía

-- [CONEXIÓN B] (mientras A no ha confirmado)
SELECT saldo FROM cuenta WHERE id_cuenta = 1001;         -- También lee 1.000.000
UPDATE cuenta SET saldo = 800000 WHERE id_cuenta = 1001;  -- Espera el lock de A

-- [CONEXIÓN A]
COMMIT;                                                  -- Libera el lock y destraba B

-- [CONEXIÓN B]
COMMIT;
SELECT saldo FROM cuenta WHERE id_cuenta = 1001;
-- Resultado: Queda en 800.000 (se pierden los cambios de A por concurrencia no controlada).

-- =====================================================================
-- 2. Reproducción del defecto de TRANSACCIONALIDAD
-- =====================================================================

UPDATE cuenta SET saldo = 1000000, version = 0 WHERE id_cuenta IN (1001, 1002);
UPDATE transferencia SET estado = 'REGISTRADA' WHERE id_transferencia = 950001;
COMMIT;

-- 1. Débito del origen: se ejecuta y confirma
UPDATE cuenta SET saldo = 700000 WHERE id_cuenta = 1001;
COMMIT;

-- 2. Simulación de falla: el proceso se cae antes de acreditar el destino

SELECT id_cuenta, saldo FROM cuenta WHERE id_cuenta IN (1001, 1002) ORDER BY id_cuenta;
-- Resultado: 1001 queda en 700.000 y 1002 sigue en 1.000.000 (dinero desaparecido).

-- =====================================================================
-- 3. Secuencia Corregida (Reemplaza la Pieza 1 original)
-- =====================================================================

UPDATE cuenta SET saldo = 1000000, version = 0 WHERE id_cuenta IN (1001, 1002);
UPDATE transferencia SET estado = 'REGISTRADA' WHERE id_transferencia = 950001;
COMMIT;

-- 1. Bloquear las dos cuentas ordenadas por id_cuenta para evitar interbloqueos
SELECT id_cuenta, saldo
  FROM cuenta
 WHERE id_cuenta IN (1001, 1002)
 ORDER BY id_cuenta
   FOR UPDATE;

-- 2. Débito del origen sobre el valor actual
UPDATE cuenta
   SET saldo   = saldo - 300000,
       version = version + 1
 WHERE id_cuenta = 1001;

-- 3. Crédito del destino sobre el valor actual
UPDATE cuenta
   SET saldo   = saldo + 300000,
       version = version + 1
 WHERE id_cuenta = 1002;

-- 4. Inserción de movimientos contables
INSERT INTO movimiento (id_movimiento, id_cuenta, id_transferencia, fecha_mov, tipo, valor)
VALUES (9500001, 1001, 950001, SYSDATE, 'DEBITO', 300000);

INSERT INTO movimiento (id_movimiento, id_cuenta, id_transferencia, fecha_mov, tipo, valor)
VALUES (9500002, 1002, 950001, SYSDATE, 'CREDITO', 300000);

-- 5. Cambiar el estado de la transferencia condicionado
UPDATE transferencia
   SET estado = 'APLICADA'
 WHERE id_transferencia = 950001
   AND estado = 'REGISTRADA';

-- 6. Confirmación atómica
COMMIT;

SELECT id_cuenta, saldo FROM cuenta WHERE id_cuenta IN (1001, 1002) ORDER BY id_cuenta;

-- =====================================================================
-- 4. Demostración cruzada: Dos transferencias simultáneas sin deadlock
-- =====================================================================

UPDATE cuenta SET saldo = 1000000, version = 0 WHERE id_cuenta IN (1001, 1002);
COMMIT;

-- [CONEXIÓN A — Transferencia 1001 -> 1002]
SELECT id_cuenta, saldo
  FROM cuenta
 WHERE id_cuenta IN (1001, 1002)
 ORDER BY id_cuenta
   FOR UPDATE;

UPDATE cuenta SET saldo = saldo - 50000, version = version + 1 WHERE id_cuenta = 1001;
UPDATE cuenta SET saldo = saldo + 50000, version = version + 1 WHERE id_cuenta = 1002;
COMMIT;

-- [CONEXIÓN B — Transferencia inversa 1002 -> 1001 (en paralelo)]
SELECT id_cuenta, saldo
  FROM cuenta
 WHERE id_cuenta IN (1001, 1002)
 ORDER BY id_cuenta
   FOR UPDATE;

UPDATE cuenta SET saldo = saldo - 50000, version = version + 1 WHERE id_cuenta = 1002;
UPDATE cuenta SET saldo = saldo + 50000, version = version + 1 WHERE id_cuenta = 1001;
COMMIT;

SELECT id_cuenta, saldo FROM cuenta WHERE id_cuenta IN (1001, 1002) ORDER BY id_cuenta;

-- =====================================================================
-- 5. Optimización de la consulta del tablero (Parte C)
-- =====================================================================

-- Plan ANTES (con función TO_CHAR que invalida el índice)
EXPLAIN PLAN FOR
SELECT s.ciudad,
       COUNT(DISTINCT t.id_transferencia) AS operaciones,
       ROUND(SUM(t.valor))               AS valor_total,
       ROUND(AVG(t.valor))               AS ticket
  FROM transferencia t
  JOIN cuenta        c ON c.id_cuenta   = t.cuenta_origen
  JOIN sucursal      s ON s.id_sucursal = c.id_sucursal
 WHERE TO_CHAR(t.fecha_transf, 'YYYY-MM') = '2026-03'
   AND t.estado = 'APLICADA'
 GROUP BY s.ciudad
 ORDER BY valor_total DESC;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(format => 'BASIC +COST +ROWS'));

-- Consulta reescrita y optimizada (rango sargable para usar el índice)
SELECT s.ciudad,
       COUNT(DISTINCT t.id_transferencia) AS operaciones,
       ROUND(SUM(t.valor))               AS valor_total,
       ROUND(AVG(t.valor))               AS ticket
  FROM transferencia t
  JOIN cuenta        c ON c.id_cuenta   = t.cuenta_origen
  JOIN sucursal      s ON s.id_sucursal = c.id_sucursal
 WHERE t.fecha_transf >= DATE '2026-03-01'
   AND t.fecha_transf <  DATE '2026-04-01'
   AND t.estado        = 'APLICADA'
 GROUP BY s.ciudad
 ORDER BY valor_total DESC;

-- Plan DESPUÉS
EXPLAIN PLAN FOR
SELECT s.ciudad,
       COUNT(DISTINCT t.id_transferencia) AS operaciones,
       ROUND(SUM(t.valor))               AS valor_total,
       ROUND(AVG(t.valor))               AS ticket
  FROM transferencia t
  JOIN cuenta        c ON c.id_cuenta   = t.cuenta_origen
  JOIN sucursal      s ON s.id_sucursal = c.id_sucursal
 WHERE t.fecha_transf >= DATE '2026-03-01'
   AND t.fecha_transf <  DATE '2026-04-01'
   AND t.estado        = 'APLICADA'
 GROUP BY s.ciudad
 ORDER BY valor_total DESC;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(format => 'BASIC +COST +ROWS'));
```

</div>

## Video del taller

<div class="evidence-video"><iframe title="Video del taller Banco Andino" loading="lazy" src="https://www.youtube-nocookie.com/embed/cFvrH1RSe6Y" allowfullscreen></iframe></div>

## Lo que aprendí

- **Un bloqueo no basta si el cálculo usa un dato viejo.** El bloqueo de fila hizo que una sesión esperara a la otra, pero el banco igual perdió $300.000 porque la segunda sesión ya había calculado el saldo con la lectura anterior. La solución fue leer con `FOR UPDATE` o restar directamente sobre el saldo actual.
- **La seguridad tiene un precio: la contención.** Mientras una transacción tiene la fila bloqueada, las demás esperan. Por eso el bloqueo pesimista sirve donde hay pocos conflictos por cuenta, y el optimista (con columna de versión) obliga a la aplicación a reintentar cuando el `UPDATE` afecta 0 filas.
- **Los interbloqueos se evitan con orden.** La regla que habría hecho imposible el `ORA-00060` es bloquear siempre las cuentas en el mismo orden fijo, sin importar cuál es el origen y cuál el destino.
- **Un índice existe, pero no siempre se usa.** Si la consulta le aplica una función a la columna (por ejemplo `UPPER()` o un `TRUNC` sobre la fecha), el optimizador hace *full scan*. Escribir predicados sargables es tan importante como crear el índice.

## Enlace para compartir el archivo

<a href="/bases-2/banco-andino/informe.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver informe final (PDF)
</a>

<a href="/bases-2/banco-andino/informe.docx" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar informe en Word
</a>

<a href="/bases-2/banco-andino/guia.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver guía del taller
</a>

<a href="/bases-2/banco-andino/04_reto_corregido.sql" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar .sql del reto corregido
</a>

<a href="https://youtu.be/cFvrH1RSe6Y" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver video en YouTube
</a>

<a href="https://github.com/gabGABY006/bases-de-datos-2/blob/main/04_reto_corregido.sql" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver .sql en GitHub
</a>

## Detalles

- Fecha: 13/09/2026
- Motor / herramienta: SQLDeveloper
- Base de datos: Oracle Autonomous Database
- Modalidad: trabajo en equipo (3 integrantes)
- Integrantes: Lina Sofia Patiño, Gabriella Castro y Julián Samuel Rodríguez
