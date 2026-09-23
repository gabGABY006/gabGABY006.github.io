---
title: "Taller Integrador — Transacciones, Concurrencia, Índices y SQL Avanzado"
---

## Título

Taller Banco Andino

## Descripción

Taller integrador de Bases de Datos 2 sobre un caso bancario simulado (Banco Andino), enfocado en diagnosticar y corregir problemas reales de concurrencia, integridad transaccional y rendimiento en Oracle.

Incluyó cuatro frentes de trabajo:

- **Concurrencia y bloqueos**: reproducción de una actualización perdida (lost update) entre dos conexiones simultáneas, y su corrección con bloqueo pesimista (`SELECT ... FOR UPDATE`) y bloqueo optimista (columna de versión). Reparto de una cola de tareas con `FOR UPDATE SKIP LOCKED`, y provocación/corrección de un interbloqueo real (`ORA-00060`) entre transferencias cruzadas.
- **Índices y optimización de consultas**: uso de `EXPLAIN PLAN` y `DBMS_XPLAN` para comparar planes de ejecución antes/después de crear índices compuestos, índices basados en función, y análisis de selectividad y *clustering factor* para justificar cuándo un índice sí se usa y cuándo no.
- **SQL avanzado**: funciones de ventana (`RANK`, `DENSE_RANK`, `ROW_NUMBER`, `LAG`), series de tiempo con acumulados y promedios móviles, CTEs recursivas para resolver jerarquías de catálogo, `MERGE` para conciliación de ajustes, y `PIVOT`/`LISTAGG` para reportes.
- **Reto integrador**: diagnóstico de cuatro defectos reales (concurrencia, transaccionalidad, trazabilidad y rendimiento) en una secuencia bancaria defectuosa, y su reescritura completa aplicando bloqueo en orden determinista, atomicidad, verificación de filas afectadas y optimización de la consulta gerencial mediante reescritura de predicados sargables.

## Enlace para compartir el archivo

<a href="https://drive.google.com/file/d/1IWLrZQqwVC9AdI0ev__h1db9BFf8WB2Y/view?usp=sharing" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver .sql del reto corregido
</a>

<a href="https://docs.google.com/document/d/1w7abQ_89fRTYNNtIIjX-jvabqb_ZbAEo/edit?usp=sharing&ouid=114714423323925828498&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver documento de respuestas
</a>

## Detalles

- Fecha: 13/09/2026
- Motor / herramienta: SQLDeveloper
- Base de datos: Oracle Autonomous Database
- Modalidad: trabajo en equipo (3 integrantes)