-- =====================================================================
-- BountyLine · Bases de Datos 2 · Reportes SQL (MySQL 8.4)
-- Autores: Gabriella Castro · Lina Patiño · Julián Rodríguez
--
-- 12 consultas de seguimiento y gestión sobre las tablas y vistas del
-- modelo relacional. No crean objetos ni modifican la estructura.
-- Requiere haber ejecutado 01_creacion.sql, 02_logica.sql y 03_insercion.sql.
-- Origen: "8. Documento SQL de Reportes BountyLine" (carpeta docs del repositorio).
-- =====================================================================
USE bountyline;

-- R01. Detalle de misiones (vista v_mision_detalle)
SELECT *
  FROM v_mision_detalle
 ORDER BY fecha_publicacion DESC, id_mision DESC;

-- R02. Misiones agrupadas por estado
SELECT estado,
       COUNT(*)              AS cantidad_misiones,
       SUM(monto_recompensa) AS valor_recompensas,
       AVG(monto_recompensa) AS promedio_recompensa
  FROM mision
 GROUP BY estado;

-- R03. Misiones por zona
SELECT z.nombre              AS zona,
       COUNT(*)              AS misiones,
       SUM(m.monto_recompensa) AS valor_total
  FROM mision m
  JOIN zona z ON z.id_zona = m.id_zona
 GROUP BY z.id_zona, z.nombre;

-- R04. Perfil y reputación de cazarrecompensas (vista v_cazarrecompensas_perfil)
SELECT *
  FROM v_cazarrecompensas_perfil
 ORDER BY reputacion DESC, misiones_completadas DESC;

-- R05. Rendimiento de cazarrecompensas: misiones cerradas y valor ganado
SELECT c.id_cuenta,
       c.alias,
       cr.reputacion,
       COUNT(CASE WHEN m.estado = 'CERRADA' THEN 1 END) AS misiones_completadas,
       COALESCE(SUM(CASE WHEN m.estado = 'CERRADA' THEN m.monto_recompensa ELSE 0 END), 0) AS valor_ganado
  FROM cazarrecompensas cr
  JOIN cuenta c ON c.id_cuenta = cr.id_cazarrecompensas
  LEFT JOIN mision m ON m.id_cazarrecompensas = cr.id_cazarrecompensas
 GROUP BY c.id_cuenta, c.alias, cr.reputacion;

-- R06. Saldos y movimientos por cuenta
SELECT c.id_cuenta,
       c.alias,
       b.saldo_disponible,
       b.saldo_retenido,
       COUNT(mv.id_movimiento) AS movimientos
  FROM cuenta c
  JOIN billetera b ON b.id_cuenta = c.id_cuenta
  LEFT JOIN movimiento mv ON mv.id_billetera = b.id_billetera
 GROUP BY c.id_cuenta, c.alias, b.saldo_disponible, b.saldo_retenido;

-- R07. Movimientos de créditos por tipo
SELECT mv.tipo,
       COUNT(*)      AS cantidad,
       SUM(mv.monto) AS monto_total
  FROM movimiento mv
 GROUP BY mv.tipo
 ORDER BY monto_total DESC;

-- R08. Postulaciones por misión
SELECT m.id_mision,
       m.titulo,
       m.estado,
       COUNT(p.id_cazarrecompensas) AS postulaciones
  FROM mision m
  LEFT JOIN postulacion p ON p.id_mision = m.id_mision
 GROUP BY m.id_mision, m.titulo, m.estado;

-- R09. Reportes por estado
SELECT estado, COUNT(*) AS cantidad
  FROM reporte
 GROUP BY estado
 ORDER BY cantidad DESC;

-- R10. Auditoría de cuentas
SELECT *
  FROM auditoria_cuenta
 ORDER BY fecha_cambio DESC;

-- R11. Misiones cerradas por mes
SELECT YEAR(fecha_cierre)  AS anio,
       MONTH(fecha_cierre) AS mes,
       COUNT(*)            AS misiones_cerradas,
       SUM(monto_recompensa) AS valor_total
  FROM mision
 WHERE estado = 'CERRADA'
 GROUP BY YEAR(fecha_cierre), MONTH(fecha_cierre)
 ORDER BY anio, mes;

-- R12. Calificaciones registradas por misión
SELECT m.id_mision,
       m.titulo,
       AVG(c.puntaje)           AS promedio,
       COUNT(c.id_calificacion) AS cantidad
  FROM mision m
  JOIN calificacion c ON c.id_mision = m.id_mision
 GROUP BY m.id_mision, m.titulo
 ORDER BY promedio DESC;