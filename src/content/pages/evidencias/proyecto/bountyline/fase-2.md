---
title: "Fase 2 · Implementación e integración"
---

## Descripción

La operación de pago permite revisar la integración de principio a fin. En MySQL, `02_logica.sql` comprueba el propietario y el estado antes de liberar créditos. En MongoDB, `01_colecciones.js` define las colecciones e índices y `04_consultas.js` muestra cómo consultar la actividad. Los documentos de conexión explican cómo se accede a ambos motores desde la aplicación.

## Infraestructura y despliegue

<details class="evidence-drop">
<summary>Selección del sistema operativo</summary>

<iframe title="Selección del sistema operativo" src="/bases-2/bountyline/fase-2/seleccion-del-sistema-operativo.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/seleccion-del-sistema-operativo.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Implementación de la máquina virtual</summary>

<iframe title="Implementación de la máquina virtual" src="/bases-2/bountyline/fase-2/implementacion-de-la-maquina-virtual.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/implementacion-de-la-maquina-virtual.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Diagrama de despliegue</summary>

<iframe title="Diagrama de despliegue" src="/bases-2/bountyline/fase-2/diagrama-de-despliegue.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/diagrama-de-despliegue.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

## Base de datos relacional

<details class="evidence-drop">
<summary>Selección del motor relacional</summary>

<iframe title="Selección del motor relacional" src="/bases-2/bountyline/fase-2/seleccion-del-motor-relacional.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/seleccion-del-motor-relacional.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Implementación del motor relacional</summary>

<iframe title="Implementación del motor relacional" src="/bases-2/bountyline/fase-2/implementacion-del-motor-relacional.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/implementacion-del-motor-relacional.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Conexión de la aplicación con la base relacional</summary>

<iframe title="Conexión de la aplicación con la base relacional" src="/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-la-base-relacional.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-la-base-relacional.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>01_creacion.sql</summary>

<div class="evidence-code">

```sql
-- =====================================================================
-- BountyLine - Script de creación de la base de datos relacional
-- Motor: MySQL 8.0 (InnoDB, utf8mb4)
-- Basado en el modelo E-R extendido y en el documento de supuestos.
-- Los códigos Sxx de los comentarios remiten al documento de supuestos.
-- =====================================================================
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS bountyline;
CREATE DATABASE bountyline CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE bountyline;

-- ---------------------------------------------------------------------
-- CUENTA (superclase)
-- ---------------------------------------------------------------------
CREATE TABLE cuenta (
    id_cuenta        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    correo           VARCHAR(120)  NOT NULL,
    alias            VARCHAR(40)   NOT NULL,
    contrasena_hash  VARCHAR(100)  NOT NULL,
    rol              VARCHAR(20)   NOT NULL,
    estado           VARCHAR(15)   NOT NULL DEFAULT 'ACTIVA',
    fecha_registro   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cuenta PRIMARY KEY (id_cuenta),
    CONSTRAINT uq_cuenta_correo UNIQUE (correo),                                   -- S9
    CONSTRAINT uq_cuenta_alias UNIQUE (alias),                                     -- S10
    CONSTRAINT ck_cuenta_rol CHECK (rol IN ('USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR')), -- S12
    CONSTRAINT ck_cuenta_estado CHECK (estado IN ('ACTIVA', 'SUSPENDIDA')),          -- S14
    CONSTRAINT ck_cuenta_correo CHECK (correo LIKE '%_@_%._%')
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- SUBCLASES: la llave primaria es la misma de CUENTA (herencia)
-- ---------------------------------------------------------------------
CREATE TABLE administrador (
    id_administrador INT UNSIGNED NOT NULL,
    nombre           VARCHAR(80)  NOT NULL,
    nivel_acceso     VARCHAR(15)  NOT NULL DEFAULT 'MODERADOR',
    CONSTRAINT pk_administrador PRIMARY KEY (id_administrador),
    CONSTRAINT fk_administrador_cuenta FOREIGN KEY (id_administrador) REFERENCES cuenta (id_cuenta),
    CONSTRAINT ck_administrador_nivel CHECK (nivel_acceso IN ('MODERADOR', 'SUPERVISOR')) -- S31
) ENGINE = InnoDB;

CREATE TABLE usuario (
    id_usuario INT UNSIGNED NOT NULL,
    biografia  VARCHAR(500) NULL,                                                  -- S19
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT fk_usuario_cuenta FOREIGN KEY (id_usuario) REFERENCES cuenta (id_cuenta)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- CATÁLOGOS (gestionados por el administrador, S32)
-- ---------------------------------------------------------------------
CREATE TABLE zona (
    id_zona          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(60)  NOT NULL,
    descripcion      VARCHAR(300) NULL,
    nivel_peligro    TINYINT UNSIGNED NOT NULL,
    id_administrador INT UNSIGNED NOT NULL,
    CONSTRAINT pk_zona PRIMARY KEY (id_zona),
    CONSTRAINT uq_zona_nombre UNIQUE (nombre),
    CONSTRAINT ck_zona_peligro CHECK (nivel_peligro BETWEEN 1 AND 5),               -- S68
    CONSTRAINT fk_zona_administrador FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador)
) ENGINE = InnoDB;

CREATE TABLE especialidad (
    id_especialidad  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(60)  NOT NULL,
    descripcion      VARCHAR(300) NULL,
    id_administrador INT UNSIGNED NOT NULL,
    CONSTRAINT pk_especialidad PRIMARY KEY (id_especialidad),
    CONSTRAINT uq_especialidad_nombre UNIQUE (nombre),
    CONSTRAINT fk_especialidad_administrador FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador)
) ENGINE = InnoDB;

CREATE TABLE cazarrecompensas (
    id_cazarrecompensas INT UNSIGNED NOT NULL,
    id_zona             INT UNSIGNED NOT NULL,                                     -- S25 zona base
    biografia           VARCHAR(500) NULL,
    disponibilidad      VARCHAR(15)  NOT NULL DEFAULT 'DISPONIBLE',
    reputacion          DECIMAL(3,2) NULL,                                         -- S27 derivado
    CONSTRAINT pk_cazarrecompensas PRIMARY KEY (id_cazarrecompensas),
    CONSTRAINT fk_cazarrecompensas_cuenta FOREIGN KEY (id_cazarrecompensas) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_cazarrecompensas_zona FOREIGN KEY (id_zona) REFERENCES zona (id_zona),
    CONSTRAINT ck_cazarrecompensas_disp CHECK (disponibilidad IN ('DISPONIBLE', 'NO_DISPONIBLE')),
    CONSTRAINT ck_cazarrecompensas_rep CHECK (reputacion IS NULL OR reputacion BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- N:M Cazarrecompensas - Especialidad (relación "Domina")
CREATE TABLE cazarrecompensas_especialidad (
    id_cazarrecompensas INT UNSIGNED     NOT NULL,
    id_especialidad     INT UNSIGNED     NOT NULL,
    nivel               TINYINT UNSIGNED NOT NULL,
    CONSTRAINT pk_caz_esp PRIMARY KEY (id_cazarrecompensas, id_especialidad),
    CONSTRAINT fk_caz_esp_caz FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT fk_caz_esp_esp FOREIGN KEY (id_especialidad) REFERENCES especialidad (id_especialidad),
    CONSTRAINT ck_caz_esp_nivel CHECK (nivel BETWEEN 1 AND 5)                       -- S26
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- BILLETERA y MOVIMIENTO
-- ---------------------------------------------------------------------
CREATE TABLE billetera (
    id_billetera        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_cuenta           INT UNSIGNED  NOT NULL,
    saldo_disponible    DECIMAL(12,2) NOT NULL DEFAULT 0,
    saldo_retenido      DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha_actualizacion DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_billetera PRIMARY KEY (id_billetera),
    CONSTRAINT uq_billetera_cuenta UNIQUE (id_cuenta),                              -- S37 1:1
    CONSTRAINT fk_billetera_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta (id_cuenta),
    CONSTRAINT ck_billetera_disp CHECK (saldo_disponible >= 0),                     -- S40
    CONSTRAINT ck_billetera_ret CHECK (saldo_retenido >= 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- MISIÓN y POSTULACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE mision (
    id_mision           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_usuario          INT UNSIGNED  NOT NULL,                                    -- Publica
    id_zona             INT UNSIGNED  NOT NULL,                                    -- Ocurre en
    id_especialidad     INT UNSIGNED  NOT NULL,                                    -- Requiere
    id_cazarrecompensas INT UNSIGNED  NULL,                                        -- Ejecuta
    id_admin_cancela    INT UNSIGNED  NULL,                                        -- Cancela
    titulo              VARCHAR(120)  NOT NULL,
    descripcion         TEXT          NOT NULL,
    monto_recompensa    DECIMAL(12,2) NOT NULL,
    estado              VARCHAR(15)   NOT NULL DEFAULT 'PUBLICADA',
    fecha_publicacion   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre        DATETIME      NULL,
    CONSTRAINT pk_mision PRIMARY KEY (id_mision),
    CONSTRAINT fk_mision_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT fk_mision_zona FOREIGN KEY (id_zona) REFERENCES zona (id_zona),
    CONSTRAINT fk_mision_especialidad FOREIGN KEY (id_especialidad) REFERENCES especialidad (id_especialidad),
    CONSTRAINT fk_mision_cazarrecompensas FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT fk_mision_admin FOREIGN KEY (id_admin_cancela) REFERENCES administrador (id_administrador),
    CONSTRAINT ck_mision_monto CHECK (monto_recompensa > 0),                        -- S51
    CONSTRAINT ck_mision_estado CHECK (estado IN ('PUBLICADA', 'ASIGNADA', 'EN_CURSO', 'CERRADA', 'CANCELADA')),
    CONSTRAINT ck_mision_cierre CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_publicacion)
) ENGINE = InnoDB;

-- N:M Cazarrecompensas - Misión (relación "Se postula")
CREATE TABLE postulacion (
    id_mision           INT UNSIGNED NOT NULL,
    id_cazarrecompensas INT UNSIGNED NOT NULL,
    fecha_postulacion   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mensaje             VARCHAR(500) NULL,
    estado_postulacion  VARCHAR(15)  NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT pk_postulacion PRIMARY KEY (id_mision, id_cazarrecompensas),         -- S57 una vez
    CONSTRAINT fk_postulacion_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT fk_postulacion_caz FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT ck_postulacion_estado CHECK (estado_postulacion IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA'))
) ENGINE = InnoDB;

CREATE TABLE movimiento (
    id_movimiento INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_billetera  INT UNSIGNED  NOT NULL,
    id_mision     INT UNSIGNED  NULL,
    tipo          VARCHAR(12)   NOT NULL,
    monto         DECIMAL(12,2) NOT NULL,
    fecha         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion   VARCHAR(200)  NULL,
    CONSTRAINT pk_movimiento PRIMARY KEY (id_movimiento),
    CONSTRAINT fk_movimiento_billetera FOREIGN KEY (id_billetera) REFERENCES billetera (id_billetera),
    CONSTRAINT fk_movimiento_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT ck_movimiento_tipo CHECK (tipo IN ('RECARGA', 'RETENCION', 'PAGO', 'COBRO', 'REEMBOLSO')), -- S44
    CONSTRAINT ck_movimiento_monto CHECK (monto > 0),                               -- S45
    CONSTRAINT ck_movimiento_mision CHECK ((tipo = 'RECARGA' AND id_mision IS NULL)
                                        OR (tipo <> 'RECARGA' AND id_mision IS NOT NULL)) -- S46, S47
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- CALIFICACIÓN (1:1 con Misión)
-- ---------------------------------------------------------------------
CREATE TABLE calificacion (
    id_calificacion INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    id_mision       INT UNSIGNED     NOT NULL,
    puntaje         TINYINT UNSIGNED NOT NULL,
    comentario      VARCHAR(500)     NULL,
    fecha           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_calificacion PRIMARY KEY (id_calificacion),
    CONSTRAINT uq_calificacion_mision UNIQUE (id_mision),                           -- S63
    CONSTRAINT fk_calificacion_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT ck_calificacion_puntaje CHECK (puntaje BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- REPORTE
-- ---------------------------------------------------------------------
CREATE TABLE reporte (
    id_reporte          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cuenta_reporta   INT UNSIGNED NOT NULL,                                     -- Genera
    id_cuenta_reportada INT UNSIGNED NULL,                                         -- Señala
    id_contenido        VARCHAR(24)  NULL,                                         -- ObjectId de MongoDB
    id_administrador    INT UNSIGNED NULL,                                         -- Atiende
    motivo              VARCHAR(300) NOT NULL,
    estado              VARCHAR(12)  NOT NULL DEFAULT 'PENDIENTE',
    fecha_reporte       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion    DATETIME     NULL,
    CONSTRAINT pk_reporte PRIMARY KEY (id_reporte),
    CONSTRAINT fk_reporte_reporta FOREIGN KEY (id_cuenta_reporta) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_reporte_reportada FOREIGN KEY (id_cuenta_reportada) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_reporte_admin FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador),
    CONSTRAINT ck_reporte_estado CHECK (estado IN ('PENDIENTE', 'RESUELTO', 'DESCARTADO')),
    CONSTRAINT ck_reporte_objetivo CHECK ((id_cuenta_reportada IS NULL) <> (id_contenido IS NULL)), -- S72
    CONSTRAINT ck_reporte_pendiente CHECK ((estado = 'PENDIENTE' AND id_administrador IS NULL AND fecha_resolucion IS NULL)
                                        OR (estado <> 'PENDIENTE' AND id_administrador IS NOT NULL AND fecha_resolucion IS NOT NULL)) -- S74
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- AUDITORÍA DE CUENTAS (la llena trg_auditoria_cuenta)
-- ---------------------------------------------------------------------
CREATE TABLE auditoria_cuenta (
    id_auditoria     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cuenta        INT UNSIGNED NOT NULL,
    campo_modificado VARCHAR(30)  NOT NULL,
    valor_anterior   VARCHAR(120) NULL,
    valor_nuevo      VARCHAR(120) NULL,
    fecha_cambio     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_bd       VARCHAR(100) NOT NULL,
    CONSTRAINT pk_auditoria PRIMARY KEY (id_auditoria),
    CONSTRAINT fk_auditoria_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta (id_cuenta)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- ÍNDICES para las consultas más frecuentes
-- ---------------------------------------------------------------------
CREATE INDEX ix_mision_estado ON mision (estado, fecha_publicacion);
CREATE INDEX ix_movimiento_billetera_fecha ON movimiento (id_billetera, fecha);
CREATE INDEX ix_reporte_estado ON reporte (estado, fecha_reporte);
CREATE INDEX ix_auditoria_cuenta_fecha ON auditoria_cuenta (id_cuenta, fecha_cambio);
```

</div>

<a href="/bases-2/bountyline/fase-2/01_creacion.sql" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>02_logica.sql</summary>

<div class="evidence-code">

```sql
-- =====================================================================
-- BountyLine - Lógica de negocio en la base de datos
-- Funciones, procedimientos almacenados, triggers y vistas.
-- Ejecutar después de 01_creacion.sql con el cliente mysql.
-- Errores de negocio: SIGNAL SQLSTATE '45000' con un mensaje claro.
-- Errores técnicos: EXIT HANDLER que hace ROLLBACK y RESIGNAL.
-- =====================================================================
SET NAMES utf8mb4;
USE bountyline;

DELIMITER $$

-- =====================================================================
-- FUNCIONES
-- =====================================================================

-- Saldo disponible de una billetera
DROP FUNCTION IF EXISTS fn_saldo_disponible $$
CREATE FUNCTION fn_saldo_disponible(p_id_billetera INT UNSIGNED)
RETURNS DECIMAL(12,2)
READS SQL DATA
BEGIN
    DECLARE v_saldo DECIMAL(12,2);
    SELECT saldo_disponible INTO v_saldo FROM billetera WHERE id_billetera = p_id_billetera;
    RETURN IFNULL(v_saldo, 0);
END $$

-- Promedio de calificaciones de un cazarrecompensas (NULL si no tiene) - S27
DROP FUNCTION IF EXISTS fn_reputacion $$
CREATE FUNCTION fn_reputacion(p_id_cazarrecompensas INT UNSIGNED)
RETURNS DECIMAL(3,2)
READS SQL DATA
BEGIN
    DECLARE v_promedio DECIMAL(3,2);
    SELECT ROUND(AVG(c.puntaje), 2) INTO v_promedio
      FROM calificacion c
      JOIN mision m ON m.id_mision = c.id_mision
     WHERE m.id_cazarrecompensas = p_id_cazarrecompensas;
    RETURN v_promedio;
END $$

-- Cantidad de misiones cerradas por un cazarrecompensas
DROP FUNCTION IF EXISTS fn_misiones_completadas $$
CREATE FUNCTION fn_misiones_completadas(p_id_cazarrecompensas INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total INT;
    SELECT COUNT(*) INTO v_total
      FROM mision
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND estado = 'CERRADA';
    RETURN v_total;
END $$

-- Puntaje de emparejamiento (0 a 100) entre un cazarrecompensas y una misión:
--   40 puntos si la zona base coincide con la zona de la misión
--   hasta 40 puntos según el nivel (1 a 5) en la especialidad requerida
--   hasta 20 puntos según la reputación (sin calificaciones cuenta como 3)
DROP FUNCTION IF EXISTS fn_puntaje_match $$
CREATE FUNCTION fn_puntaje_match(p_id_cazarrecompensas INT UNSIGNED, p_id_mision INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_zona_caz INT UNSIGNED;
    DECLARE v_rep DECIMAL(3,2);
    DECLARE v_zona_mis INT UNSIGNED;
    DECLARE v_esp_mis INT UNSIGNED;
    DECLARE v_nivel INT DEFAULT 0;

    SELECT id_zona, reputacion INTO v_zona_caz, v_rep
      FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas;
    SELECT id_zona, id_especialidad INTO v_zona_mis, v_esp_mis
      FROM mision WHERE id_mision = p_id_mision;
    SELECT IFNULL(MAX(nivel), 0) INTO v_nivel
      FROM cazarrecompensas_especialidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = v_esp_mis;

    RETURN IF(v_zona_caz = v_zona_mis, 40, 0)
         + v_nivel * 8
         + ROUND(IFNULL(v_rep, 3) * 4);
END $$

-- =====================================================================
-- PROCEDIMIENTOS: CUENTAS
-- =====================================================================

-- Registra una cuenta de Usuario o Cazarrecompensas con su perfil y su billetera
-- en una sola transacción (S30, S37). p_especialidades es un arreglo JSON:
--   [{"id": 1, "nivel": 4}, {"id": 3, "nivel": 2}]
DROP PROCEDURE IF EXISTS sp_registrar_cuenta $$
CREATE PROCEDURE sp_registrar_cuenta(
    IN  p_correo          VARCHAR(120),
    IN  p_alias           VARCHAR(40),
    IN  p_contrasena_hash VARCHAR(100),
    IN  p_rol             VARCHAR(20),
    IN  p_biografia       VARCHAR(500),
    IN  p_id_zona         INT UNSIGNED,
    IN  p_especialidades  JSON,
    OUT p_id_cuenta       INT UNSIGNED)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_rol NOT IN ('USUARIO', 'CAZARRECOMPENSAS') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Desde la aplicación solo se registran cuentas de Usuario o Cazarrecompensas.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE correo = p_correo) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está registrado.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE alias = p_alias) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El alias ya está en uso.';
    END IF;
    IF p_rol = 'CAZARRECOMPENSAS' THEN
        IF p_id_zona IS NULL OR NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe tener una zona base válida.';
        END IF;
        IF p_especialidades IS NULL OR JSON_LENGTH(p_especialidades) = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe registrar al menos una especialidad.';
        END IF;
    END IF;

    START TRANSACTION;
        INSERT INTO cuenta (correo, alias, contrasena_hash, rol)
        VALUES (p_correo, p_alias, p_contrasena_hash, p_rol);
        SET p_id_cuenta = LAST_INSERT_ID();

        IF p_rol = 'USUARIO' THEN
            INSERT INTO usuario (id_usuario, biografia) VALUES (p_id_cuenta, p_biografia);
        ELSE
            INSERT INTO cazarrecompensas (id_cazarrecompensas, id_zona, biografia)
            VALUES (p_id_cuenta, p_id_zona, p_biografia);

            INSERT INTO cazarrecompensas_especialidad (id_cazarrecompensas, id_especialidad, nivel)
            SELECT p_id_cuenta, j.id, j.nivel
              FROM JSON_TABLE(p_especialidades, '$[*]'
                   COLUMNS (id INT UNSIGNED PATH '$.id', nivel TINYINT UNSIGNED PATH '$.nivel')) AS j;
        END IF;

        INSERT INTO billetera (id_cuenta) VALUES (p_id_cuenta);
    COMMIT;
END $$

-- Crea una cuenta de Administrador. Solo lo ejecuta el usuario de base de datos
-- administrador durante la instalación (S30); la aplicación no tiene permiso.
DROP PROCEDURE IF EXISTS sp_registrar_administrador $$
CREATE PROCEDURE sp_registrar_administrador(
    IN  p_correo          VARCHAR(120),
    IN  p_alias           VARCHAR(40),
    IN  p_contrasena_hash VARCHAR(100),
    IN  p_nombre          VARCHAR(80),
    IN  p_nivel_acceso    VARCHAR(15),
    OUT p_id_cuenta       INT UNSIGNED)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        INSERT INTO cuenta (correo, alias, contrasena_hash, rol)
        VALUES (p_correo, p_alias, p_contrasena_hash, 'ADMINISTRADOR');
        SET p_id_cuenta = LAST_INSERT_ID();
        INSERT INTO administrador (id_administrador, nombre, nivel_acceso)
        VALUES (p_id_cuenta, p_nombre, p_nivel_acceso);
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: BILLETERA
-- =====================================================================

-- Recarga simulada de créditos (S46)
DROP PROCEDURE IF EXISTS sp_recargar_saldo $$
CREATE PROCEDURE sp_recargar_saldo(
    IN p_id_cuenta INT UNSIGNED,
    IN p_monto     DECIMAL(12,2))
BEGIN
    DECLARE v_id_billetera INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_monto IS NULL OR p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto de la recarga debe ser mayor que cero.';
    END IF;
    SELECT estado INTO v_estado FROM cuenta WHERE id_cuenta = p_id_cuenta;
    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    ELSEIF v_estado = 'SUSPENDIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta está suspendida.';
    END IF;

    START TRANSACTION;
        SELECT id_billetera INTO v_id_billetera
          FROM billetera WHERE id_cuenta = p_id_cuenta FOR UPDATE;
        IF v_id_billetera IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene billetera.';
        END IF;

        UPDATE billetera SET saldo_disponible = saldo_disponible + p_monto
         WHERE id_billetera = v_id_billetera;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_id_billetera, NULL, 'RECARGA', p_monto, 'Recarga simulada de créditos');
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: MISIONES
-- =====================================================================

-- Publica una misión y retiene el monto del saldo disponible (S52)
DROP PROCEDURE IF EXISTS sp_publicar_mision $$
CREATE PROCEDURE sp_publicar_mision(
    IN  p_id_usuario      INT UNSIGNED,
    IN  p_id_zona         INT UNSIGNED,
    IN  p_id_especialidad INT UNSIGNED,
    IN  p_titulo          VARCHAR(120),
    IN  p_descripcion     TEXT,
    IN  p_monto           DECIMAL(12,2),
    OUT p_id_mision       INT UNSIGNED)
BEGIN
    DECLARE v_id_billetera INT UNSIGNED;
    DECLARE v_disponible DECIMAL(12,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF NOT EXISTS (SELECT 1 FROM usuario u JOIN cuenta c ON c.id_cuenta = u.id_usuario
                    WHERE u.id_usuario = p_id_usuario AND c.estado = 'ACTIVA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un usuario activo puede publicar misiones.';
    END IF;
    IF p_monto IS NULL OR p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto de la recompensa debe ser mayor que cero.';
    END IF;

    START TRANSACTION;
        SELECT id_billetera, saldo_disponible INTO v_id_billetera, v_disponible
          FROM billetera WHERE id_cuenta = p_id_usuario FOR UPDATE;
        IF v_disponible < p_monto THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para publicar la misión.';
        END IF;

        INSERT INTO mision (id_usuario, id_zona, id_especialidad, titulo, descripcion, monto_recompensa)
        VALUES (p_id_usuario, p_id_zona, p_id_especialidad, p_titulo, p_descripcion, p_monto);
        SET p_id_mision = LAST_INSERT_ID();

        UPDATE billetera
           SET saldo_disponible = saldo_disponible - p_monto,
               saldo_retenido   = saldo_retenido + p_monto
         WHERE id_billetera = v_id_billetera;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_id_billetera, p_id_mision, 'RETENCION', p_monto, CONCAT('Retención por la misión ', p_id_mision));
    COMMIT;
END $$

-- Un cazarrecompensas se postula a una misión publicada (S56, S57)
DROP PROCEDURE IF EXISTS sp_postular $$
CREATE PROCEDURE sp_postular(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_mensaje             VARCHAR(500))
BEGIN
    DECLARE v_estado VARCHAR(15);

    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas z JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
                    WHERE z.id_cazarrecompensas = p_id_cazarrecompensas AND c.estado = 'ACTIVA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un cazarrecompensas activo puede postularse.';
    END IF;
    SELECT estado INTO v_estado FROM mision WHERE id_mision = p_id_mision;
    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
    ELSEIF v_estado <> 'PUBLICADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede postular a misiones en estado PUBLICADA.';
    END IF;
    IF EXISTS (SELECT 1 FROM postulacion WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas ya se postuló a esta misión.';
    END IF;

    INSERT INTO postulacion (id_mision, id_cazarrecompensas, mensaje)
    VALUES (p_id_mision, p_id_cazarrecompensas, p_mensaje);
END $$

-- El usuario asigna la misión a uno de los postulados (S56, S58)
DROP PROCEDURE IF EXISTS sp_asignar_cazarrecompensas $$
CREATE PROCEDURE sp_asignar_cazarrecompensas(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_usuario          INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado INTO v_dueno, v_estado
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL OR v_dueno <> p_id_usuario THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede asignarla.';
        END IF;
        IF v_estado <> 'PUBLICADA' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden asignar misiones en estado PUBLICADA.';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM postulacion
                        WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas asignado debe ser uno de los postulados.';
        END IF;

        UPDATE mision SET id_cazarrecompensas = p_id_cazarrecompensas, estado = 'ASIGNADA'
         WHERE id_mision = p_id_mision;
        UPDATE postulacion
           SET estado_postulacion = IF(id_cazarrecompensas = p_id_cazarrecompensas, 'ACEPTADA', 'RECHAZADA')
         WHERE id_mision = p_id_mision;
    COMMIT;
END $$

-- El cazarrecompensas asignado inicia la misión (ASIGNADA -> EN_CURSO)
DROP PROCEDURE IF EXISTS sp_iniciar_mision $$
CREATE PROCEDURE sp_iniciar_mision(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision
                    WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el cazarrecompensas asignado puede iniciar la misión.';
    END IF;
    UPDATE mision SET estado = 'EN_CURSO' WHERE id_mision = p_id_mision;   -- el trigger valida la transición
END $$

-- El usuario confirma el cierre: se libera el pago en una sola transacción (S59)
DROP PROCEDURE IF EXISTS sp_cerrar_mision $$
CREATE PROCEDURE sp_cerrar_mision(
    IN p_id_mision  INT UNSIGNED,
    IN p_id_usuario INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE v_monto DECIMAL(12,2);
    DECLARE v_caz INT UNSIGNED;
    DECLARE v_bil_usuario INT UNSIGNED;
    DECLARE v_bil_caz INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado, monto_recompensa, id_cazarrecompensas
          INTO v_dueno, v_estado, v_monto, v_caz
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL OR v_dueno <> p_id_usuario THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede cerrarla.';
        END IF;
        IF v_estado <> 'EN_CURSO' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden cerrar misiones en estado EN_CURSO.';
        END IF;

        SELECT id_billetera INTO v_bil_usuario FROM billetera WHERE id_cuenta = v_dueno FOR UPDATE;
        SELECT id_billetera INTO v_bil_caz FROM billetera WHERE id_cuenta = v_caz FOR UPDATE;

        UPDATE billetera SET saldo_retenido = saldo_retenido - v_monto WHERE id_billetera = v_bil_usuario;
        UPDATE billetera SET saldo_disponible = saldo_disponible + v_monto WHERE id_billetera = v_bil_caz;

        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion) VALUES
            (v_bil_usuario, p_id_mision, 'PAGO', v_monto, CONCAT('Pago de la misión ', p_id_mision)),
            (v_bil_caz, p_id_mision, 'COBRO', v_monto, CONCAT('Cobro de la misión ', p_id_mision));

        UPDATE mision SET estado = 'CERRADA', fecha_cierre = NOW() WHERE id_mision = p_id_mision;
    COMMIT;
END $$

-- Cancela una misión y devuelve el monto retenido (S60). La cancela su usuario
-- (p_id_administrador = NULL) o un administrador (S34).
DROP PROCEDURE IF EXISTS sp_cancelar_mision $$
CREATE PROCEDURE sp_cancelar_mision(
    IN p_id_mision        INT UNSIGNED,
    IN p_id_usuario       INT UNSIGNED,
    IN p_id_administrador INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE v_monto DECIMAL(12,2);
    DECLARE v_bil_usuario INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado, monto_recompensa INTO v_dueno, v_estado, v_monto
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
        END IF;
        IF p_id_administrador IS NULL AND (p_id_usuario IS NULL OR v_dueno <> p_id_usuario) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión o un administrador puede cancelarla.';
        END IF;
        IF p_id_administrador IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El administrador no existe.';
        END IF;
        IF v_estado NOT IN ('PUBLICADA', 'ASIGNADA', 'EN_CURSO') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión ya está cerrada o cancelada.';
        END IF;

        SELECT id_billetera INTO v_bil_usuario FROM billetera WHERE id_cuenta = v_dueno FOR UPDATE;
        UPDATE billetera
           SET saldo_retenido   = saldo_retenido - v_monto,
               saldo_disponible = saldo_disponible + v_monto
         WHERE id_billetera = v_bil_usuario;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_bil_usuario, p_id_mision, 'REEMBOLSO', v_monto, CONCAT('Reembolso por cancelación de la misión ', p_id_mision));

        UPDATE mision SET estado = 'CANCELADA', id_admin_cancela = p_id_administrador
         WHERE id_mision = p_id_mision;
        UPDATE postulacion SET estado_postulacion = 'RECHAZADA'
         WHERE id_mision = p_id_mision AND estado_postulacion = 'PENDIENTE';
    COMMIT;
END $$

-- Sugerencias de cazarrecompensas DISPONIBLES para una misión (S24), ordenadas por puntaje
DROP PROCEDURE IF EXISTS sp_sugerir_cazarrecompensas $$
CREATE PROCEDURE sp_sugerir_cazarrecompensas(
    IN p_id_mision INT UNSIGNED,
    IN p_limite    INT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision WHERE id_mision = p_id_mision) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
    END IF;

    SELECT z.id_cazarrecompensas,
           c.alias,
           zo.nombre                                  AS zona,
           z.reputacion,
           fn_misiones_completadas(z.id_cazarrecompensas) AS misiones_completadas,
           fn_puntaje_match(z.id_cazarrecompensas, p_id_mision) AS puntaje
      FROM cazarrecompensas z
      JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
      JOIN zona zo  ON zo.id_zona = z.id_zona
     WHERE z.disponibilidad = 'DISPONIBLE'
       AND c.estado = 'ACTIVA'
     ORDER BY puntaje DESC, misiones_completadas DESC
     LIMIT p_limite;
END $$

-- El usuario califica una misión cerrada (S62, S63)
DROP PROCEDURE IF EXISTS sp_calificar_mision $$
CREATE PROCEDURE sp_calificar_mision(
    IN p_id_mision  INT UNSIGNED,
    IN p_id_usuario INT UNSIGNED,
    IN p_puntaje    TINYINT UNSIGNED,
    IN p_comentario VARCHAR(500))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision WHERE id_mision = p_id_mision AND id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede calificarla.';
    END IF;
    IF EXISTS (SELECT 1 FROM calificacion WHERE id_mision = p_id_mision) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión ya fue calificada.';
    END IF;
    INSERT INTO calificacion (id_mision, puntaje, comentario)
    VALUES (p_id_mision, p_puntaje, p_comentario);         -- trg_validar_calificacion revisa el estado
END $$

-- =====================================================================
-- PROCEDIMIENTOS: CATÁLOGOS Y MODERACIÓN
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_crear_zona $$
CREATE PROCEDURE sp_crear_zona(
    IN  p_id_administrador INT UNSIGNED,
    IN  p_nombre           VARCHAR(60),
    IN  p_descripcion      VARCHAR(300),
    IN  p_nivel_peligro    TINYINT UNSIGNED,
    OUT p_id_zona          INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede crear zonas.';
    END IF;
    IF EXISTS (SELECT 1 FROM zona WHERE nombre = p_nombre) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una zona con ese nombre.';
    END IF;
    INSERT INTO zona (nombre, descripcion, nivel_peligro, id_administrador)
    VALUES (p_nombre, p_descripcion, p_nivel_peligro, p_id_administrador);
    SET p_id_zona = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_crear_especialidad $$
CREATE PROCEDURE sp_crear_especialidad(
    IN  p_id_administrador INT UNSIGNED,
    IN  p_nombre           VARCHAR(60),
    IN  p_descripcion      VARCHAR(300),
    OUT p_id_especialidad  INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede crear especialidades.';
    END IF;
    IF EXISTS (SELECT 1 FROM especialidad WHERE nombre = p_nombre) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una especialidad con ese nombre.';
    END IF;
    INSERT INTO especialidad (nombre, descripcion, id_administrador)
    VALUES (p_nombre, p_descripcion, p_id_administrador);
    SET p_id_especialidad = LAST_INSERT_ID();
END $$

-- Crea un reporte contra una cuenta o contra un contenido de MongoDB (S72)
DROP PROCEDURE IF EXISTS sp_crear_reporte $$
CREATE PROCEDURE sp_crear_reporte(
    IN  p_id_cuenta_reporta   INT UNSIGNED,
    IN  p_id_cuenta_reportada INT UNSIGNED,
    IN  p_id_contenido        VARCHAR(24),
    IN  p_motivo              VARCHAR(300),
    OUT p_id_reporte          INT UNSIGNED)
BEGIN
    IF (p_id_cuenta_reportada IS NULL) = (p_id_contenido IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte debe dirigirse a una cuenta o a un contenido, no a ambos.';
    END IF;
    IF p_id_cuenta_reportada = p_id_cuenta_reporta THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una cuenta no puede reportarse a sí misma.';
    END IF;
    INSERT INTO reporte (id_cuenta_reporta, id_cuenta_reportada, id_contenido, motivo)
    VALUES (p_id_cuenta_reporta, p_id_cuenta_reportada, p_id_contenido, p_motivo);
    SET p_id_reporte = LAST_INSERT_ID();
END $$

-- Un administrador atiende un reporte y, si corresponde, suspende la cuenta señalada (S33, S35)
DROP PROCEDURE IF EXISTS sp_resolver_reporte $$
CREATE PROCEDURE sp_resolver_reporte(
    IN p_id_reporte       INT UNSIGNED,
    IN p_id_administrador INT UNSIGNED,
    IN p_estado           VARCHAR(12),
    IN p_suspender        BOOLEAN)
BEGIN
    DECLARE v_estado VARCHAR(12);
    DECLARE v_reportada INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_estado NOT IN ('RESUELTO', 'DESCARTADO') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte solo puede quedar RESUELTO o DESCARTADO.';
    END IF;

    START TRANSACTION;
        SELECT estado, id_cuenta_reportada INTO v_estado, v_reportada
          FROM reporte WHERE id_reporte = p_id_reporte FOR UPDATE;
        IF v_estado IS NULL OR v_estado <> 'PENDIENTE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe o ya fue atendido.';
        END IF;

        UPDATE reporte
           SET estado = p_estado, id_administrador = p_id_administrador, fecha_resolucion = NOW()
         WHERE id_reporte = p_id_reporte;

        IF p_suspender AND p_estado = 'RESUELTO' AND v_reportada IS NOT NULL THEN
            UPDATE cuenta SET estado = 'SUSPENDIDA' WHERE id_cuenta = v_reportada;  -- queda en auditoría
        END IF;
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: ACTUALIZACIÓN DE PERFILES, CUENTAS Y CATÁLOGOS
-- =====================================================================

-- El usuario actualiza su biografía (S19)
DROP PROCEDURE IF EXISTS sp_actualizar_usuario $$
CREATE PROCEDURE sp_actualizar_usuario(
    IN p_id_usuario INT UNSIGNED,
    IN p_biografia  VARCHAR(500))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
    END IF;
    UPDATE usuario SET biografia = p_biografia WHERE id_usuario = p_id_usuario;
END $$

-- El cazarrecompensas actualiza su zona base, biografía y disponibilidad (S23 a S25)
DROP PROCEDURE IF EXISTS sp_actualizar_cazarrecompensas $$
CREATE PROCEDURE sp_actualizar_cazarrecompensas(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_zona             INT UNSIGNED,
    IN p_biografia           VARCHAR(500),
    IN p_disponibilidad      VARCHAR(15))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no existe.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La zona no existe.';
    END IF;
    IF p_disponibilidad NOT IN ('DISPONIBLE', 'NO_DISPONIBLE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La disponibilidad debe ser DISPONIBLE o NO_DISPONIBLE.';
    END IF;
    UPDATE cazarrecompensas
       SET id_zona = p_id_zona, biografia = p_biografia, disponibilidad = p_disponibilidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas;
END $$

-- Agrega una especialidad al cazarrecompensas o cambia su nivel (S26)
DROP PROCEDURE IF EXISTS sp_guardar_especialidad_caz $$
CREATE PROCEDURE sp_guardar_especialidad_caz(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_especialidad     INT UNSIGNED,
    IN p_nivel               TINYINT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no existe.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM especialidad WHERE id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La especialidad no existe.';
    END IF;
    IF p_nivel IS NULL OR p_nivel NOT BETWEEN 1 AND 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nivel debe estar entre 1 y 5.';
    END IF;
    INSERT INTO cazarrecompensas_especialidad (id_cazarrecompensas, id_especialidad, nivel)
    VALUES (p_id_cazarrecompensas, p_id_especialidad, p_nivel)
    ON DUPLICATE KEY UPDATE nivel = p_nivel;
END $$

-- Quita una especialidad; el cazarrecompensas debe conservar al menos una (S26)
DROP PROCEDURE IF EXISTS sp_quitar_especialidad_caz $$
CREATE PROCEDURE sp_quitar_especialidad_caz(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_especialidad     INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas_especialidad
                    WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no tiene esa especialidad.';
    END IF;
    IF (SELECT COUNT(*) FROM cazarrecompensas_especialidad WHERE id_cazarrecompensas = p_id_cazarrecompensas) <= 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe conservar al menos una especialidad.';
    END IF;
    DELETE FROM cazarrecompensas_especialidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = p_id_especialidad;
END $$

-- Cambia el correo de una cuenta; queda en la auditoría (S9, S76)
DROP PROCEDURE IF EXISTS sp_cambiar_correo $$
CREATE PROCEDURE sp_cambiar_correo(
    IN p_id_cuenta INT UNSIGNED,
    IN p_correo    VARCHAR(120))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cuenta WHERE id_cuenta = p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE correo = p_correo AND id_cuenta <> p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está registrado.';
    END IF;
    UPDATE cuenta SET correo = p_correo WHERE id_cuenta = p_id_cuenta;
END $$

-- Un administrador suspende o reactiva una cuenta; queda en la auditoría (S14, S35)
-- Cambia la contraseña de una cuenta. Llega ya cifrada con BCrypt (S11);
-- la aplicación comprueba antes la contraseña actual. Queda en la auditoría.
DROP PROCEDURE IF EXISTS sp_cambiar_contrasena $$
CREATE PROCEDURE sp_cambiar_contrasena(
    IN p_id_cuenta INT UNSIGNED,
    IN p_hash      VARCHAR(100))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cuenta WHERE id_cuenta = p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    END IF;
    IF p_hash IS NULL OR CHAR_LENGTH(p_hash) < 50 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La contraseña debe llegar cifrada.';
    END IF;
    UPDATE cuenta SET contrasena_hash = p_hash WHERE id_cuenta = p_id_cuenta;
END $$

DROP PROCEDURE IF EXISTS sp_cambiar_estado_cuenta $$
CREATE PROCEDURE sp_cambiar_estado_cuenta(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_cuenta        INT UNSIGNED,
    IN p_estado           VARCHAR(15))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede cambiar el estado de una cuenta.';
    END IF;
    IF p_estado NOT IN ('ACTIVA', 'SUSPENDIDA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estado debe ser ACTIVA o SUSPENDIDA.';
    END IF;
    IF p_id_cuenta = p_id_administrador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un administrador no puede cambiar el estado de su propia cuenta.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM cuenta WHERE id_cuenta = p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    END IF;
    UPDATE cuenta SET estado = p_estado WHERE id_cuenta = p_id_cuenta;
END $$

DROP PROCEDURE IF EXISTS sp_actualizar_zona $$
CREATE PROCEDURE sp_actualizar_zona(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_zona          INT UNSIGNED,
    IN p_nombre           VARCHAR(60),
    IN p_descripcion      VARCHAR(300),
    IN p_nivel_peligro    TINYINT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede modificar zonas.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La zona no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM zona WHERE nombre = p_nombre AND id_zona <> p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una zona con ese nombre.';
    END IF;
    UPDATE zona SET nombre = p_nombre, descripcion = p_descripcion, nivel_peligro = p_nivel_peligro
     WHERE id_zona = p_id_zona;
END $$

DROP PROCEDURE IF EXISTS sp_actualizar_especialidad $$
CREATE PROCEDURE sp_actualizar_especialidad(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_especialidad  INT UNSIGNED,
    IN p_nombre           VARCHAR(60),
    IN p_descripcion      VARCHAR(300))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede modificar especialidades.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM especialidad WHERE id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La especialidad no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM especialidad WHERE nombre = p_nombre AND id_especialidad <> p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una especialidad con ese nombre.';
    END IF;
    UPDATE especialidad SET nombre = p_nombre, descripcion = p_descripcion
     WHERE id_especialidad = p_id_especialidad;
END $$

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Impide transiciones de estado no permitidas en Misión (S55)
DROP TRIGGER IF EXISTS trg_validar_estado_mision $$
CREATE TRIGGER trg_validar_estado_mision
BEFORE UPDATE ON mision
FOR EACH ROW
BEGIN
    IF NEW.estado <> OLD.estado AND NOT (
           (OLD.estado = 'PUBLICADA' AND NEW.estado IN ('ASIGNADA', 'CANCELADA'))
        OR (OLD.estado = 'ASIGNADA'  AND NEW.estado IN ('EN_CURSO', 'CANCELADA'))
        OR (OLD.estado = 'EN_CURSO'  AND NEW.estado IN ('CERRADA', 'CANCELADA'))) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado de misión no permitida.';
    END IF;
    IF NEW.estado = 'ASIGNADA' AND NEW.id_cazarrecompensas IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una misión ASIGNADA debe tener cazarrecompensas.';
    END IF;
END $$

-- Recalcula la reputación del cazarrecompensas al recibir una calificación (S27)
DROP TRIGGER IF EXISTS trg_actualizar_reputacion $$
CREATE TRIGGER trg_actualizar_reputacion
AFTER INSERT ON calificacion
FOR EACH ROW
BEGIN
    DECLARE v_caz INT UNSIGNED;
    SELECT id_cazarrecompensas INTO v_caz FROM mision WHERE id_mision = NEW.id_mision;
    UPDATE cazarrecompensas SET reputacion = fn_reputacion(v_caz)
     WHERE id_cazarrecompensas = v_caz;
END $$

-- Impide saldos negativos con un mensaje claro (S40)
DROP TRIGGER IF EXISTS trg_validar_saldo $$
CREATE TRIGGER trg_validar_saldo
BEFORE UPDATE ON billetera
FOR EACH ROW
BEGIN
    IF NEW.saldo_disponible < 0 OR NEW.saldo_retenido < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La operación dejaría un saldo negativo.';
    END IF;
END $$

-- Solo se califican misiones CERRADAS (S62)
DROP TRIGGER IF EXISTS trg_validar_calificacion $$
CREATE TRIGGER trg_validar_calificacion
BEFORE INSERT ON calificacion
FOR EACH ROW
BEGIN
    IF (SELECT estado FROM mision WHERE id_mision = NEW.id_mision) <> 'CERRADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden calificar misiones CERRADAS.';
    END IF;
END $$

-- Registra en la auditoría los cambios de estado y de correo (S76, S77)
DROP TRIGGER IF EXISTS trg_auditoria_cuenta $$
CREATE TRIGGER trg_auditoria_cuenta
AFTER UPDATE ON cuenta
FOR EACH ROW
BEGIN
    IF NEW.estado <> OLD.estado THEN
        INSERT INTO auditoria_cuenta (id_cuenta, campo_modificado, valor_anterior, valor_nuevo, usuario_bd)
        VALUES (NEW.id_cuenta, 'estado', OLD.estado, NEW.estado, USER());
    END IF;
    IF NEW.correo <> OLD.correo THEN
        INSERT INTO auditoria_cuenta (id_cuenta, campo_modificado, valor_anterior, valor_nuevo, usuario_bd)
        VALUES (NEW.id_cuenta, 'correo', OLD.correo, NEW.correo, USER());
    END IF;
    -- El cambio de contraseña se registra sin guardar ningún hash
    IF NEW.contrasena_hash <> OLD.contrasena_hash THEN
        INSERT INTO auditoria_cuenta (id_cuenta, campo_modificado, valor_anterior, valor_nuevo, usuario_bd)
        VALUES (NEW.id_cuenta, 'contrasena', NULL, NULL, USER());
    END IF;
END $$

-- El rol no cambia después del registro (S13)
DROP TRIGGER IF EXISTS trg_rol_inmutable $$
CREATE TRIGGER trg_rol_inmutable
BEFORE UPDATE ON cuenta
FOR EACH ROW
BEGIN
    IF NEW.rol <> OLD.rol THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol de una cuenta no se puede cambiar.';
    END IF;
END $$

-- Los movimientos y la auditoría no se modifican ni se eliminan (S48, S79)
DROP TRIGGER IF EXISTS trg_movimiento_inmutable $$
CREATE TRIGGER trg_movimiento_inmutable
BEFORE UPDATE ON movimiento
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los movimientos no se pueden modificar.';
END $$

DROP TRIGGER IF EXISTS trg_movimiento_no_borrar $$
CREATE TRIGGER trg_movimiento_no_borrar
BEFORE DELETE ON movimiento
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los movimientos no se pueden eliminar.';
END $$

DROP TRIGGER IF EXISTS trg_auditoria_inmutable $$
CREATE TRIGGER trg_auditoria_inmutable
BEFORE UPDATE ON auditoria_cuenta
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La auditoría no se puede modificar.';
END $$

DROP TRIGGER IF EXISTS trg_auditoria_no_borrar $$
CREATE TRIGGER trg_auditoria_no_borrar
BEFORE DELETE ON auditoria_cuenta
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La auditoría no se puede eliminar.';
END $$

-- Cada perfil debe coincidir con el rol de su cuenta (especialización disjunta)
DROP TRIGGER IF EXISTS trg_rol_usuario $$
CREATE TRIGGER trg_rol_usuario
BEFORE INSERT ON usuario
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_usuario) <> 'USUARIO' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol USUARIO.';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_rol_cazarrecompensas $$
CREATE TRIGGER trg_rol_cazarrecompensas
BEFORE INSERT ON cazarrecompensas
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_cazarrecompensas) <> 'CAZARRECOMPENSAS' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol CAZARRECOMPENSAS.';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_rol_administrador $$
CREATE TRIGGER trg_rol_administrador
BEFORE INSERT ON administrador
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_administrador) <> 'ADMINISTRADOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol ADMINISTRADOR.';
    END IF;
END $$

-- Los administradores no tienen billetera (S36)
DROP TRIGGER IF EXISTS trg_billetera_jugador $$
CREATE TRIGGER trg_billetera_jugador
BEFORE INSERT ON billetera
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_cuenta) = 'ADMINISTRADOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las cuentas de administrador no tienen billetera.';
    END IF;
END $$

DELIMITER ;

-- =====================================================================
-- VISTAS (la aplicación las consulta en lugar de armar joins)
-- =====================================================================
CREATE OR REPLACE VIEW v_mision_detalle AS
SELECT m.id_mision, m.titulo, m.descripcion, m.monto_recompensa, m.estado,
       m.fecha_publicacion, m.fecha_cierre,
       m.id_usuario, cu.alias AS alias_usuario,
       m.id_zona, z.nombre AS zona,
       m.id_especialidad, e.nombre AS especialidad,
       m.id_cazarrecompensas, cc.alias AS alias_cazarrecompensas,
       (SELECT COUNT(*) FROM postulacion p WHERE p.id_mision = m.id_mision) AS postulaciones
  FROM mision m
  JOIN cuenta cu       ON cu.id_cuenta = m.id_usuario
  JOIN zona z          ON z.id_zona = m.id_zona
  JOIN especialidad e  ON e.id_especialidad = m.id_especialidad
  LEFT JOIN cuenta cc  ON cc.id_cuenta = m.id_cazarrecompensas;

CREATE OR REPLACE VIEW v_cazarrecompensas_perfil AS
SELECT z.id_cazarrecompensas, c.alias, c.estado AS estado_cuenta, z.biografia,
       z.disponibilidad, z.reputacion, z.id_zona, zo.nombre AS zona,
       fn_misiones_completadas(z.id_cazarrecompensas) AS misiones_completadas,
       (SELECT GROUP_CONCAT(CONCAT(e.nombre, ':', ce.nivel) ORDER BY ce.nivel DESC SEPARATOR ', ')
          FROM cazarrecompensas_especialidad ce
          JOIN especialidad e ON e.id_especialidad = ce.id_especialidad
         WHERE ce.id_cazarrecompensas = z.id_cazarrecompensas) AS especialidades
  FROM cazarrecompensas z
  JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
  JOIN zona zo  ON zo.id_zona = z.id_zona;

-- Bitácora del administrador: une en orden de fecha los eventos de pagos,
-- misiones, reportes y cambios de cuenta.
CREATE OR REPLACE VIEW v_bitacora AS
SELECT 'PAGO' AS tipo, mv.tipo AS accion, mv.fecha,
       b.id_cuenta, c.alias AS operador,
       CONCAT('MOV-', mv.id_movimiento) AS referencia, mv.id_mision,
       CONCAT(mv.tipo, ' de ', FORMAT(mv.monto, 2), IFNULL(CONCAT(' - ', mv.descripcion), '')) AS detalle
  FROM movimiento mv
  JOIN billetera b ON b.id_billetera = mv.id_billetera
  JOIN cuenta c    ON c.id_cuenta = b.id_cuenta
UNION ALL
SELECT 'MISION', 'PUBLICADA', m.fecha_publicacion,
       m.id_usuario, c.alias, CONCAT('MIS-', m.id_mision), m.id_mision,
       CONCAT('Publicó "', m.titulo, '" por ', FORMAT(m.monto_recompensa, 2))
  FROM mision m
  JOIN cuenta c ON c.id_cuenta = m.id_usuario
UNION ALL
SELECT 'MISION', m.estado, m.fecha_cierre,
       IFNULL(m.id_admin_cancela, m.id_usuario), c.alias, CONCAT('MIS-', m.id_mision), m.id_mision,
       CONCAT('Misión "', m.titulo, '" ', LOWER(m.estado))
  FROM mision m
  JOIN cuenta c ON c.id_cuenta = IFNULL(m.id_admin_cancela, m.id_usuario)
 WHERE m.estado IN ('CERRADA', 'CANCELADA') AND m.fecha_cierre IS NOT NULL
UNION ALL
SELECT 'REPORTE', 'CREADO', r.fecha_reporte,
       r.id_cuenta_reporta, c.alias, CONCAT('REP-', r.id_reporte), NULL, r.motivo
  FROM reporte r
  JOIN cuenta c ON c.id_cuenta = r.id_cuenta_reporta
UNION ALL
SELECT 'REPORTE', r.estado, r.fecha_resolucion,
       r.id_administrador, c.alias, CONCAT('REP-', r.id_reporte), NULL,
       CONCAT('Reporte ', LOWER(r.estado))
  FROM reporte r
  JOIN cuenta c ON c.id_cuenta = r.id_administrador
 WHERE r.estado <> 'PENDIENTE'
UNION ALL
SELECT 'CUENTA', UPPER(a.campo_modificado), a.fecha_cambio,
       a.id_cuenta, c.alias, CONCAT('AUD-', a.id_auditoria), NULL,
       CASE WHEN a.campo_modificado = 'contrasena' THEN 'Cambió la contraseña'
            ELSE CONCAT(a.campo_modificado, ': ', IFNULL(a.valor_anterior, '-'), ' -> ', IFNULL(a.valor_nuevo, '-')) END
  FROM auditoria_cuenta a
  JOIN cuenta c ON c.id_cuenta = a.id_cuenta;
```

</div>

<a href="/bases-2/bountyline/fase-2/02_logica.sql" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>03_insercion.sql</summary>

<div class="evidence-code">

```sql
-- =====================================================================
-- BountyLine - Script de inserción de datos de prueba
-- Los datos se cargan llamando a los procedimientos almacenados, así que
-- también sirven como prueba de la lógica de negocio.
-- Contraseña de todas las cuentas de prueba: BountyLine2026*
-- (se guarda solo su hash BCrypt, S11)
-- Ejecutar con el usuario administrador de la base de datos.
-- =====================================================================
SET NAMES utf8mb4;
USE bountyline;

-- Administradores (S30: se crean por script)
CALL sp_registrar_administrador('admin@bountyline.gg', 'ADMIN_ROOT', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'Laura Méndez', 'SUPERVISOR', @adm1);
CALL sp_registrar_administrador('moderacion@bountyline.gg', 'MOD_SHADE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'Andrés Pardo', 'MODERADOR', @adm2);

-- Catálogo de zonas (S32, S68)
CALL sp_crear_zona(@adm1, 'Distrito Centro', 'Corazón comercial y financiero de la ciudad.', 3, @z1);
CALL sp_crear_zona(@adm1, 'Puerto', 'Muelles, contenedores y contrabando.', 4, @z2);
CALL sp_crear_zona(@adm1, 'Zona industrial', 'Fábricas abandonadas y talleres clandestinos.', 4, @z3);
CALL sp_crear_zona(@adm1, 'Suburbios', 'Barrios residenciales en la periferia.', 2, @z4);
CALL sp_crear_zona(@adm1, 'Anillo Orbital', 'Estación elevada sobre la ciudad, de acceso restringido.', 5, @z5);

-- Catálogo de especialidades
CALL sp_crear_especialidad(@adm2, 'Recuperación', 'Recuperar créditos, objetos o vehículos robados.', @e1);
CALL sp_crear_especialidad(@adm2, 'Protección', 'Proteger a una persona o un lugar durante un tiempo.', @e2);
CALL sp_crear_especialidad(@adm2, 'Escolta', 'Acompañar un traslado de un punto a otro.', @e3);
CALL sp_crear_especialidad(@adm2, 'Venganza', 'Cobrar una ofensa o una deuda pendiente.', @e4);
CALL sp_crear_especialidad(@adm2, 'Sabotaje', 'Inhabilitar equipos, vehículos o instalaciones.', @e5);

-- Cuentas de Usuario (perfil + billetera en una transacción, S37)
CALL sp_registrar_cuenta('axiom_47@bountyline.gg', 'AXIOM_47', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Jugador del Distrito Centro, siempre con algún problema.', NULL, NULL, @u1);
CALL sp_registrar_cuenta('kira_09@bountyline.gg', 'KIRA_09', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u2);
CALL sp_registrar_cuenta('nova_12@bountyline.gg', 'NOVA_12', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Comerciante del puerto.', NULL, NULL, @u3);
CALL sp_registrar_cuenta('ghost_line@bountyline.gg', 'GHOST_LINE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u4);
CALL sp_registrar_cuenta('neon_rat@bountyline.gg', 'NEON_RAT', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Busco ayuda para recuperar lo mío.', NULL, NULL, @u5);
CALL sp_registrar_cuenta('zero_day@bountyline.gg', 'ZERO_DAY', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u6);
CALL sp_registrar_cuenta('lux_88@bountyline.gg', 'LUX_88', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Coleccionista de piezas raras.', NULL, NULL, @u7);
CALL sp_registrar_cuenta('orbit_7@bountyline.gg', 'ORBIT_7', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u8);
CALL sp_registrar_cuenta('mantis@bountyline.gg', 'MANTIS', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u9);
CALL sp_registrar_cuenta('cipher_3@bountyline.gg', 'CIPHER_3', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Hacker retirado.', NULL, NULL, @u10);
CALL sp_registrar_cuenta('drift_99@bountyline.gg', 'DRIFT_99', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u11);
CALL sp_registrar_cuenta('echo_v@bountyline.gg', 'ECHO_V', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Nuevo en la ciudad.', NULL, NULL, @u12);

-- Cuentas de Cazarrecompensas (zona base y especialidades con nivel, S25, S26)
CALL sp_registrar_cuenta('vanta_k@bountyline.gg', 'VANTA_K', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Distrito Centro.', @z1, JSON_ARRAY(JSON_OBJECT('id', @e1, 'nivel', 5), JSON_OBJECT('id', @e4, 'nivel', 3)), @c1);
CALL sp_registrar_cuenta('ronin_x@bountyline.gg', 'RONIN_X', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Puerto.', @z2, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 5), JSON_OBJECT('id', @e3, 'nivel', 4)), @c2);
CALL sp_registrar_cuenta('nightmare@bountyline.gg', 'NIGHTMARE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Zona industrial.', @z3, JSON_ARRAY(JSON_OBJECT('id', @e5, 'nivel', 5), JSON_OBJECT('id', @e1, 'nivel', 2)), @c3);
CALL sp_registrar_cuenta('spectre_8@bountyline.gg', 'SPECTRE_8', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Suburbios.', @z4, JSON_ARRAY(JSON_OBJECT('id', @e4, 'nivel', 5)), @c4);
CALL sp_registrar_cuenta('halo_22@bountyline.gg', 'HALO_22', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Distrito Centro.', @z1, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 4), JSON_OBJECT('id', @e3, 'nivel', 3)), @c5);
CALL sp_registrar_cuenta('jinx_404@bountyline.gg', 'JINX_404', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Zona industrial.', @z3, JSON_ARRAY(JSON_OBJECT('id', @e5, 'nivel', 4), JSON_OBJECT('id', @e4, 'nivel', 2)), @c6);
CALL sp_registrar_cuenta('viper_q@bountyline.gg', 'VIPER_Q', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Puerto.', @z2, JSON_ARRAY(JSON_OBJECT('id', @e1, 'nivel', 4), JSON_OBJECT('id', @e3, 'nivel', 5)), @c7);
CALL sp_registrar_cuenta('onyx@bountyline.gg', 'ONYX', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Anillo Orbital.', @z5, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 3), JSON_OBJECT('id', @e5, 'nivel', 3)), @c8);
CALL sp_registrar_cuenta('razor_11@bountyline.gg', 'RAZOR_11', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Suburbios.', @z4, JSON_ARRAY(JSON_OBJECT('id', @e4, 'nivel', 4), JSON_OBJECT('id', @e1, 'nivel', 3)), @c9);
CALL sp_registrar_cuenta('sable@bountyline.gg', 'SABLE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Anillo Orbital.', @z5, JSON_ARRAY(JSON_OBJECT('id', @e3, 'nivel', 4), JSON_OBJECT('id', @e2, 'nivel', 2)), @c10);

-- Recargas simuladas (S46)
CALL sp_recargar_saldo(@u1, 50000);
CALL sp_recargar_saldo(@u2, 40000);
CALL sp_recargar_saldo(@u3, 50000);
CALL sp_recargar_saldo(@u4, 60000);
CALL sp_recargar_saldo(@u5, 40000);
CALL sp_recargar_saldo(@u6, 40000);
CALL sp_recargar_saldo(@u7, 60000);
CALL sp_recargar_saldo(@u8, 40000);
CALL sp_recargar_saldo(@u9, 50000);
CALL sp_recargar_saldo(@u10, 60000);
CALL sp_recargar_saldo(@u11, 40000);
CALL sp_recargar_saldo(@u12, 60000);
CALL sp_recargar_saldo(@u1, 15000);
CALL sp_recargar_saldo(@c1, 2000);

-- Misiones: cada publicación retiene el monto (S52)
CALL sp_publicar_mision(@u1, @z2, @e1, 'Recuperar el chip de identidad', 'Detalles de la misión: recuperar el chip de identidad. Más información por el chat.', 2400, @m1);
CALL sp_publicar_mision(@u2, @z5, @e4, 'Saldar cuentas con un ex socio', 'Detalles de la misión: saldar cuentas con un ex socio. Más información por el chat.', 5900, @m2);
CALL sp_publicar_mision(@u3, @z5, @e3, 'Escolta hacia el Puerto Gris', 'Detalles de la misión: escolta hacia el puerto gris. Más información por el chat.', 3200, @m3);
CALL sp_publicar_mision(@u4, @z1, @e2, 'Custodia de testigo en el muelle 4', 'Detalles de la misión: custodia de testigo en el muelle 4. Más información por el chat.', 4800, @m4);
CALL sp_publicar_mision(@u5, @z3, @e4, 'Cobrar el robo de mi apartamento', 'Detalles de la misión: cobrar el robo de mi apartamento. Más información por el chat.', 2400, @m5);
CALL sp_publicar_mision(@u6, @z5, @e3, 'Acompañar un traslado al Anillo Orbital', 'Detalles de la misión: acompañar un traslado al anillo orbital. Más información por el chat.', 2400, @m6);
CALL sp_publicar_mision(@u7, @z5, @e2, 'Vigilar el bar Neón durante el cierre', 'Detalles de la misión: vigilar el bar neón durante el cierre. Más información por el chat.', 1500, @m7);
CALL sp_publicar_mision(@u8, @z5, @e5, 'Cortar la energía del laboratorio', 'Detalles de la misión: cortar la energía del laboratorio. Más información por el chat.', 4800, @m8);
CALL sp_publicar_mision(@u9, @z4, @e4, 'Cobrar una deuda al Clan Hoshi', 'Detalles de la misión: cobrar una deuda al clan hoshi. Más información por el chat.', 8400, @m9);
CALL sp_publicar_mision(@u10, @z3, @e3, 'Escoltar a un informante', 'Detalles de la misión: escoltar a un informante. Más información por el chat.', 9600, @m10);
CALL sp_publicar_mision(@u11, @z5, @e1, 'Rescatar un disco de datos', 'Detalles de la misión: rescatar un disco de datos. Más información por el chat.', 9600, @m11);
CALL sp_publicar_mision(@u12, @z3, @e5, 'Sabotear la grúa del muelle 2', 'Detalles de la misión: sabotear la grúa del muelle 2. Más información por el chat.', 5900, @m12);
CALL sp_publicar_mision(@u1, @z2, @e2, 'Cuidar un envío en la estación', 'Detalles de la misión: cuidar un envío en la estación. Más información por el chat.', 3200, @m13);
CALL sp_publicar_mision(@u2, @z2, @e4, 'Dar una lección al estafador del mercado', 'Detalles de la misión: dar una lección al estafador del mercado. Más información por el chat.', 2400, @m14);
CALL sp_publicar_mision(@u3, @z5, @e1, 'Recuperar créditos del Clan Kuro', 'Detalles de la misión: recuperar créditos del clan kuro. Más información por el chat.', 5900, @m15);
CALL sp_publicar_mision(@u4, @z5, @e5, 'Apagar el generador de la fábrica 9', 'Detalles de la misión: apagar el generador de la fábrica 9. Más información por el chat.', 9600, @m16);
CALL sp_publicar_mision(@u5, @z3, @e5, 'Inhabilitar las cámaras del depósito', 'Detalles de la misión: inhabilitar las cámaras del depósito. Más información por el chat.', 9600, @m17);
CALL sp_publicar_mision(@u6, @z3, @e2, 'Proteger mi taller esta noche', 'Detalles de la misión: proteger mi taller esta noche. Más información por el chat.', 2400, @m18);
CALL sp_publicar_mision(@u7, @z1, @e5, 'Desactivar el sistema de alarmas', 'Detalles de la misión: desactivar el sistema de alarmas. Más información por el chat.', 8400, @m19);
CALL sp_publicar_mision(@u8, @z2, @e5, 'Bloquear la señal de un dron', 'Detalles de la misión: bloquear la señal de un dron. Más información por el chat.', 7200, @m20);
CALL sp_publicar_mision(@u9, @z2, @e3, 'Mover un contenedor sellado', 'Detalles de la misión: mover un contenedor sellado. Más información por el chat.', 9600, @m21);
CALL sp_publicar_mision(@u10, @z4, @e1, 'Devolver mi moto robada', 'Detalles de la misión: devolver mi moto robada. Más información por el chat.', 1500, @m22);
CALL sp_publicar_mision(@u11, @z1, @e1, 'Cargamento perdido en el anillo industrial', 'Detalles de la misión: cargamento perdido en el anillo industrial. Más información por el chat.', 7200, @m23);
CALL sp_publicar_mision(@u12, @z3, @e2, 'Proteger una caravana en los suburbios', 'Detalles de la misión: proteger una caravana en los suburbios. Más información por el chat.', 7200, @m24);

-- Postulaciones, asignaciones, inicio, cierre y cancelaciones
CALL sp_postular(@m1, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m1, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m1, @c8, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m1, @u1, @c1);
CALL sp_iniciar_mision(@m1, @c1);
CALL sp_cerrar_mision(@m1, @u1);
CALL sp_postular(@m2, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m2, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m2, @c7, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m2, @u2, @c1);
CALL sp_iniciar_mision(@m2, @c1);
CALL sp_cerrar_mision(@m2, @u2);
CALL sp_postular(@m3, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m3, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m3, @c8, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m3, @u3, @c2);
CALL sp_iniciar_mision(@m3, @c2);
CALL sp_cerrar_mision(@m3, @u3);
CALL sp_postular(@m4, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m4, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m4, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m4, @u4, @c2);
CALL sp_iniciar_mision(@m4, @c2);
CALL sp_cerrar_mision(@m4, @u4);
CALL sp_postular(@m5, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m5, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m5, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m5, @u5, @c1);
CALL sp_iniciar_mision(@m5, @c1);
CALL sp_cerrar_mision(@m5, @u5);
CALL sp_postular(@m6, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m6, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m6, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m6, @u6, @c2);
CALL sp_iniciar_mision(@m6, @c2);
CALL sp_cerrar_mision(@m6, @u6);
CALL sp_postular(@m7, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m7, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m7, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m7, @u7, @c2);
CALL sp_iniciar_mision(@m7, @c2);
CALL sp_cerrar_mision(@m7, @u7);
CALL sp_postular(@m8, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m8, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m8, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m8, @u8, @c3);
CALL sp_iniciar_mision(@m8, @c3);
CALL sp_cerrar_mision(@m8, @u8);
CALL sp_postular(@m9, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m9, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m9, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m9, @u9, @c1);
CALL sp_iniciar_mision(@m9, @c1);
CALL sp_cerrar_mision(@m9, @u9);
CALL sp_postular(@m10, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m10, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m10, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m10, @u10, @c2);
CALL sp_iniciar_mision(@m10, @c2);
CALL sp_cerrar_mision(@m10, @u10);
CALL sp_postular(@m11, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m11, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m11, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m11, @u11, @c1);
CALL sp_iniciar_mision(@m11, @c1);
CALL sp_postular(@m12, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m12, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m12, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m12, @u12, @c3);
CALL sp_iniciar_mision(@m12, @c3);
CALL sp_postular(@m13, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m13, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m13, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m13, @u1, @c2);
CALL sp_iniciar_mision(@m13, @c2);
CALL sp_postular(@m14, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m14, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m14, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m14, @u2, @c1);
CALL sp_postular(@m15, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m15, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m15, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m15, @u3, @c1);
CALL sp_postular(@m16, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m16, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m16, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m16, @u4, @c3);
CALL sp_postular(@m17, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m17, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m17, @c7, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m18, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m20, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m22, NULL, @adm2);
CALL sp_postular(@m23, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m23, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m23, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m23, @u11, NULL);
CALL sp_postular(@m24, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m24, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m24, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m24, NULL, @adm2);

-- Calificaciones de misiones cerradas (S62, S63); actualizan la reputación por trigger
CALL sp_calificar_mision(@m1, @u1, 4, 'Rápido y sin problemas.');
CALL sp_calificar_mision(@m2, @u2, 3, 'Cumplió, aunque tardó un poco.');
CALL sp_calificar_mision(@m3, @u3, 5, NULL);
CALL sp_calificar_mision(@m4, @u4, 4, 'Excelente trabajo.');
CALL sp_calificar_mision(@m5, @u5, 4, 'Muy profesional.');
CALL sp_calificar_mision(@m6, @u6, 5, NULL);
CALL sp_calificar_mision(@m7, @u7, 3, 'Recomendado.');
CALL sp_calificar_mision(@m8, @u8, 5, 'Bien.');
CALL sp_calificar_mision(@m9, @u9, 3, 'Lo volvería a contratar.');

-- Reportes (S72, S74) y su atención por un administrador (S33, S35)
CALL sp_crear_reporte(@u2, @c6, NULL, 'Amenazas por el chat de la misión.', @r1);
CALL sp_crear_reporte(@u5, NULL, '665f1c2a9b3e4d0012ab34cd', 'Publicación con datos personales de otro jugador.', @r2);
CALL sp_crear_reporte(@c3, @u9, NULL, 'Intento de fraude con la recompensa.', @r3);
CALL sp_crear_reporte(@u7, NULL, '665f1c2a9b3e4d0012ab34d1', 'Comentario ofensivo.', @r4);
CALL sp_resolver_reporte(@r1, @adm2, 'RESUELTO', TRUE);
CALL sp_resolver_reporte(@r2, @adm2, 'RESUELTO', FALSE);
CALL sp_resolver_reporte(@r3, @adm1, 'DESCARTADO', FALSE);

-- Cambio de correo para dejar evidencia en la auditoría (S76)
UPDATE cuenta SET correo = 'kira.09@bountyline.gg' WHERE id_cuenta = @u2;

-- Resumen
SELECT 'cuenta' AS tabla, COUNT(*) AS registros FROM cuenta UNION ALL SELECT 'mision', COUNT(*) FROM mision UNION ALL SELECT 'postulacion', COUNT(*) FROM postulacion UNION ALL SELECT 'movimiento', COUNT(*) FROM movimiento UNION ALL SELECT 'calificacion', COUNT(*) FROM calificacion UNION ALL SELECT 'reporte', COUNT(*) FROM reporte UNION ALL SELECT 'auditoria_cuenta', COUNT(*) FROM auditoria_cuenta;
```

</div>

<a href="/bases-2/bountyline/fase-2/03_insercion.sql" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>04_usuarios.sql</summary>

<div class="evidence-code">

```sql
-- =====================================================================
-- BountyLine - Usuarios de base de datos y permisos (privilegio mínimo)
-- bountyline_app   : lo usa el backend. Solo ejecuta procedimientos y
--                    consulta tablas y vistas; no puede escribir directo.
-- bountyline_admin : mantenimiento, carga de scripts y respaldos.
-- Cambie las contraseñas antes de usar fuera del laboratorio.
-- =====================================================================
SET NAMES utf8mb4;
DROP USER IF EXISTS 'bountyline_app'@'%';
DROP USER IF EXISTS 'bountyline_admin'@'%';

CREATE USER 'bountyline_app'@'%' IDENTIFIED BY '<CONTRASENA_LOCAL>';
CREATE USER 'bountyline_admin'@'%' IDENTIFIED BY '<CONTRASENA_LOCAL>';

GRANT SELECT, EXECUTE ON bountyline.* TO 'bountyline_app'@'%';
-- sp_registrar_administrador queda fuera del alcance de la aplicación (S30)
REVOKE EXECUTE ON bountyline.* FROM 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_registrar_cuenta TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_recargar_saldo TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_publicar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_postular TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_asignar_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_iniciar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cerrar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cancelar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_sugerir_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_calificar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_zona TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_especialidad TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_reporte TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_resolver_reporte TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_usuario TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_guardar_especialidad_caz TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_quitar_especialidad_caz TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_correo TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_contrasena TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_estado_cuenta TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_zona TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_especialidad TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_saldo_disponible TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_reputacion TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_misiones_completadas TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_puntaje_match TO 'bountyline_app'@'%';

GRANT ALL PRIVILEGES ON bountyline.* TO 'bountyline_admin'@'%';

FLUSH PRIVILEGES;
```

</div>

<a href="/bases-2/bountyline/fase-2/04_usuarios.sql" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

## MongoDB

<details class="evidence-drop">
<summary>Modelo documental</summary>

<iframe title="Modelo documental" src="/bases-2/bountyline/fase-2/modelo-documental.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/modelo-documental.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Implementación de MongoDB</summary>

<iframe title="Implementación de MongoDB" src="/bases-2/bountyline/fase-2/implementacion-de-mongodb.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/implementacion-de-mongodb.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Conexión de la aplicación con MongoDB</summary>

<iframe title="Conexión de la aplicación con MongoDB" src="/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-mongodb.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/conexion-de-la-aplicacion-con-mongodb.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>01_colecciones.js</summary>

<div class="evidence-code">

```javascript
// =====================================================================
// BountyLine - MongoDB: creación de la base, colecciones, validadores e índices
// Contenido social (S6, S80-S85): publicaciones, mensajes de chat y
// bitácora de actividad. Las cuentas y misiones viven en MySQL y aquí se
// referencian por su identificador (id_cuenta, id_mision).
// Ejecutar con: mongosh 01_colecciones.js, o abrirlo como Playground en VS Code
// =====================================================================
use('bountyline');
db.dropDatabase();

// ---------------------------------------------------------------------
// publicaciones: un documento por publicación del feed, con sus
// comentarios y reacciones embebidos (S81). Solo texto (S80).
// ---------------------------------------------------------------------
db.createCollection('publicaciones', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id_cuenta', 'alias', 'rol', 'texto', 'etiquetas', 'reacciones', 'comentarios',
                 'estado_moderacion', 'fecha_publicacion'],
      properties: {
        id_cuenta: { bsonType: 'int', minimum: 1, description: 'id_cuenta del autor en MySQL' },
        alias: { bsonType: 'string', minLength: 3, maxLength: 40 },
        rol: { enum: ['USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR'] },
        texto: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        etiquetas: { bsonType: 'array', maxItems: 10, uniqueItems: true,
                     items: { bsonType: 'string', pattern: '^[a-z0-9_]{2,30}$' } },
        id_zona: { bsonType: ['int', 'null'], minimum: 1 },
        zona: { bsonType: ['string', 'null'] },
        id_mision: { bsonType: ['int', 'null'], minimum: 1, description: 'misión de MySQL a la que se refiere, opcional' },
        reacciones: {
          bsonType: 'object',
          required: ['me_gusta', 'fuego', 'alerta'],
          properties: {
            me_gusta: { bsonType: 'int', minimum: 0 },
            fuego: { bsonType: 'int', minimum: 0 },
            alerta: { bsonType: 'int', minimum: 0 }
          }
        },
        reaccionaron: {
          bsonType: 'array',
          description: 'quién reaccionó y con qué tipo; una reacción por cuenta',
          items: {
            bsonType: 'object',
            required: ['id_cuenta', 'tipo'],
            properties: {
              id_cuenta: { bsonType: 'int', minimum: 1 },
              tipo: { enum: ['me_gusta', 'fuego', 'alerta'] }
            }
          }
        },
        comentarios: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['_id', 'id_cuenta', 'alias', 'texto', 'fecha', 'estado_moderacion'],
            properties: {
              _id: { bsonType: 'objectId' },
              id_cuenta: { bsonType: 'int', minimum: 1 },
              alias: { bsonType: 'string' },
              texto: { bsonType: 'string', minLength: 1, maxLength: 500 },
              fecha: { bsonType: 'date' },
              estado_moderacion: { enum: ['VISIBLE', 'OCULTO'] }
            }
          }
        },
        estado_moderacion: { enum: ['VISIBLE', 'OCULTA'] },
        fecha_publicacion: { bsonType: 'date' },
        fecha_edicion: { bsonType: ['date', 'null'] }
      }
    }
  }
});
db.publicaciones.createIndex({ fecha_publicacion: -1 }, { name: 'ix_pub_fecha' });
db.publicaciones.createIndex({ etiquetas: 1, fecha_publicacion: -1 }, { name: 'ix_pub_etiquetas' });
db.publicaciones.createIndex({ id_zona: 1, fecha_publicacion: -1 }, { name: 'ix_pub_zona' });
db.publicaciones.createIndex({ id_cuenta: 1, fecha_publicacion: -1 }, { name: 'ix_pub_autor' });
db.publicaciones.createIndex({ id_mision: 1 }, { name: 'ix_pub_mision', sparse: true });
db.publicaciones.createIndex({ 'comentarios._id': 1 }, { name: 'ix_pub_comentario' });
db.publicaciones.createIndex({ texto: 'text', etiquetas: 'text' },
  { name: 'tx_pub_texto', default_language: 'spanish', weights: { etiquetas: 3, texto: 1 } });

// ---------------------------------------------------------------------
// mensajes_chat: un documento por mensaje para que ningún documento
// crezca sin límite. Chat solo de texto entre el usuario y el
// cazarrecompensas asignado a la misión (S82, S83).
// ---------------------------------------------------------------------
db.createCollection('mensajes_chat', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id_mision', 'id_emisor', 'alias_emisor', 'rol_emisor', 'texto', 'fecha', 'leido'],
      properties: {
        id_mision: { bsonType: 'int', minimum: 1 },
        id_emisor: { bsonType: 'int', minimum: 1 },
        alias_emisor: { bsonType: 'string' },
        rol_emisor: { enum: ['USUARIO', 'CAZARRECOMPENSAS'] },
        texto: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        fecha: { bsonType: 'date' },
        leido: { bsonType: 'bool' }
      }
    }
  }
});
db.mensajes_chat.createIndex({ id_mision: 1, fecha: 1 }, { name: 'ix_chat_mision_fecha' });
db.mensajes_chat.createIndex({ id_emisor: 1, fecha: -1 }, { name: 'ix_chat_emisor' });

// ---------------------------------------------------------------------
// bitacora_actividad: eventos de uso (S84). Cada tipo trae campos
// distintos; solo se validan los comunes.
// ---------------------------------------------------------------------
db.createCollection('bitacora_actividad', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tipo', 'id_cuenta', 'fecha'],
      properties: {
        tipo: { enum: ['INICIO_SESION', 'CIERRE_SESION', 'BUSQUEDA', 'VISTA_MISION', 'VISTA_PERFIL', 'PUBLICACION'] },
        id_cuenta: { bsonType: 'int', minimum: 1 },
        rol: { enum: ['USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR'] },
        fecha: { bsonType: 'date' },
        exito: { bsonType: 'bool' },
        pantalla: { bsonType: 'string' },
        filtros: { bsonType: 'object' },
        resultados: { bsonType: 'int', minimum: 0 },
        id_mision: { bsonType: 'int', minimum: 1 },
        id_cuenta_vista: { bsonType: 'int', minimum: 1 },
        id_publicacion: { bsonType: 'objectId' }
      }
    }
  }
});
db.bitacora_actividad.createIndex({ id_cuenta: 1, fecha: -1 }, { name: 'ix_bit_cuenta' });
db.bitacora_actividad.createIndex({ tipo: 1, fecha: -1 }, { name: 'ix_bit_tipo' });

print('Colecciones creadas: ' + db.getCollectionNames().sort().join(', '));
```

</div>

<a href="/bases-2/bountyline/fase-2/01_colecciones.js" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>02_insercion.js</summary>

<div class="evidence-code">

```javascript
// =====================================================================
// BountyLine - MongoDB: datos de prueba
// Las cuentas (id_cuenta) y misiones (id_mision) existen en los datos de
// prueba de MySQL (bd/mysql/03_insercion.sql). Los documentos con
// ObjectId 665f1c2a9b3e4d0012ab34cd (publicación) y ...34d1 (comentario)
// son los que aparecen reportados en la tabla reporte de MySQL (S72).
// Ejecutar con: mongosh 02_insercion.js, o abrirlo como Playground en VS Code
// =====================================================================
use('bountyline');

db.publicaciones.insertMany([
  {
    _id: ObjectId("6730a1b2c3d4e5f600000001"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien sabe quién maneja el contrabando en los muelles esta semana? Hay movimiento raro.",
    etiquetas: ["puerto", "contrabando"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(8), fuego: NumberInt(0), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(8), tipo: 'alerta' }, { id_cuenta: NumberInt(6), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'me_gusta' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(5), tipo: 'me_gusta' }, { id_cuenta: NumberInt(20), tipo: 'me_gusta' }, { id_cuenta: NumberInt(4), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000002"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Te escribo por privado.", fecha: ISODate("2026-11-05T00:32:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-03T15:32:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000003"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Busco cazarrecompensas con experiencia en escoltas hacia el Anillo Orbital. Pago justo.",
    etiquetas: ["escolta", "anillo_orbital"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(19), tipo: 'alerta' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'fuego' }, { id_cuenta: NumberInt(5), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000004"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Te escribo por privado.", fecha: ISODate("2026-10-26T10:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000005"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Te escribo por privado.", fecha: ISODate("2026-10-25T21:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000006"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Cuidado con eso.", fecha: ISODate("2026-10-26T09:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000007"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Eso no es cierto.", fecha: ISODate("2026-10-25T21:37:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-25T15:37:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000008"),
    id_cuenta: NumberInt(5), alias: "NOVA_12", rol: 'USUARIO',
    texto: "Ojo con los drones de vigilancia nuevos en la zona industrial, detectan calor.",
    etiquetas: ["alerta", "zona_industrial"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: NumberInt(7),
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(4), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(15), tipo: 'fuego' }, { id_cuenta: NumberInt(1), tipo: 'fuego' }, { id_cuenta: NumberInt(2), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'fuego' }, { id_cuenta: NumberInt(5), tipo: 'fuego' }, { id_cuenta: NumberInt(21), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'alerta' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-06T21:43:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000009"),
    id_cuenta: NumberInt(6), alias: "GHOST_LINE", rol: 'USUARIO',
    texto: "Terminé una misión de recuperación sin un rasguño. Gracias VANTA_K.",
    etiquetas: ["recuperacion", "recomendado"],
    id_zona: null, zona: null,
    id_mision: NumberInt(2),
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(6), tipo: 'fuego' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'alerta' }, { id_cuenta: NumberInt(11), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000000a"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-13T23:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000b"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-14T16:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000c"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Cuidado con eso.", fecha: ISODate("2026-10-13T20:45:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-13T11:45:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000000d"),
    id_cuenta: NumberInt(4), alias: "KIRA_09", rol: 'USUARIO',
    texto: "Los suburbios están tranquilos de noche, pero no confíen en las cámaras del metro.",
    etiquetas: ["suburbios", "seguridad"],
    id_zona: NumberInt(4), zona: "Suburbios",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'alerta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000000e"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Cuidado con eso.", fecha: ISODate("2026-10-15T06:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000f"), id_cuenta: NumberInt(5), alias: "NOVA_12", texto: "Gracias por el dato.", fecha: ISODate("2026-10-14T16:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000010"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-16T01:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000011"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-16T02:28:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-14T11:28:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000012"),
    id_cuenta: NumberInt(10), alias: "ORBIT_7", rol: 'USUARIO',
    texto: "Nueva ruta de suministro por el Distrito Centro, menos patrullas después de las 22:00.",
    etiquetas: ["distrito_centro", "rutas"],
    id_zona: NumberInt(1), zona: "Distrito Centro",
    id_mision: NumberInt(21),
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(2), tipo: 'fuego' }, { id_cuenta: NumberInt(1), tipo: 'alerta' }, { id_cuenta: NumberInt(15), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000013"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Te escribo por privado.", fecha: ISODate("2026-10-21T20:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000014"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Cuidado con eso.", fecha: ISODate("2026-10-21T01:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000015"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Gracias por el dato.", fecha: ISODate("2026-10-21T02:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000016"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Eso no es cierto.", fecha: ISODate("2026-10-22T04:12:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-20T19:12:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000017"),
    id_cuenta: NumberInt(12), alias: "CIPHER_3", rol: 'USUARIO',
    texto: "El Clan Kuro está cobrando peaje en el puerto. Si van a pasar, vayan en grupo.",
    etiquetas: ["puerto", "clanes", "alerta"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("665f1c2a9b3e4d0012ab34d1"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Cállate, nadie te preguntó. (comentario reportado)", fecha: ISODate("2026-11-07T13:59:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-07T10:59:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000018"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "Vendo mapa de los túneles de mantenimiento del anillo. Solo créditos.",
    etiquetas: ["anillo_orbital", "mapas"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: NumberInt(14),
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(14), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000019"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-18T23:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001a"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-19T14:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001b"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Yo también lo vi.", fecha: ISODate("2026-10-20T08:01:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-18T19:01:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000001c"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien más perdió conexión en el sector 7? Parece sabotaje.",
    etiquetas: ["sabotaje", "zona_industrial"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(3), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(5), tipo: 'fuego' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }, { id_cuenta: NumberInt(2), tipo: 'fuego' }, { id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000001d"), id_cuenta: NumberInt(7), alias: "NEON_RAT", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-28T08:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001e"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-28T01:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001f"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-27T14:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000020"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Gracias por el dato.", fecha: ISODate("2026-10-28T09:46:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-26T18:46:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000021"),
    id_cuenta: NumberInt(5), alias: "NOVA_12", rol: 'USUARIO',
    texto: "Primer día como cazarrecompensas. Consejos para conseguir buenas calificaciones?",
    etiquetas: ["novato", "consejos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(2), tipo: 'alerta' }, { id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'fuego' }, { id_cuenta: NumberInt(17), tipo: 'me_gusta' }, { id_cuenta: NumberInt(22), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000022"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Cuidado con eso.", fecha: ISODate("2026-11-02T12:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000023"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-11-02T10:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000024"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Gracias por el dato.", fecha: ISODate("2026-11-01T01:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000025"), id_cuenta: NumberInt(5), alias: "NOVA_12", texto: "Eso no es cierto.", fecha: ISODate("2026-11-01T04:01:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-31T20:01:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000026"),
    id_cuenta: NumberInt(3), alias: "AXIOM_47", rol: 'USUARIO',
    texto: "Tip: siempre pidan que la misión quede ASIGNADA antes de moverse. Así el pago está retenido.",
    etiquetas: ["consejos", "pagos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(13), tipo: 'alerta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000027"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Eso no es cierto.", fecha: ISODate("2026-10-21T03:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000028"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Eso no es cierto.", fecha: ISODate("2026-10-20T19:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000029"), id_cuenta: NumberInt(7), alias: "NEON_RAT", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-21T11:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002a"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-20T06:07:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-19T19:07:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000002b"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "El generador de la fábrica 9 vuelve a fallar. Atentos a los apagones.",
    etiquetas: ["zona_industrial", "energia"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(11), tipo: 'me_gusta' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-05T13:53:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000002c"),
    id_cuenta: NumberInt(6), alias: "GHOST_LINE", rol: 'USUARIO',
    texto: "Recomiendo a RONIN_X para escoltas, puntual y discreto.",
    etiquetas: ["escolta", "recomendado"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000002d"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Te escribo por privado.", fecha: ISODate("2026-11-04T01:17:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002e"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Excelente aporte.", fecha: ISODate("2026-11-03T12:17:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002f"), id_cuenta: NumberInt(17), alias: "NIGHTMARE", texto: "Gracias por el dato.", fecha: ISODate("2026-11-03T12:17:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-02T15:17:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000030"),
    id_cuenta: NumberInt(11), alias: "MANTIS", rol: 'USUARIO',
    texto: "Hay una banda robando motos cerca del mercado del Distrito Centro.",
    etiquetas: ["distrito_centro", "robos", "alerta"],
    id_zona: NumberInt(1), zona: "Distrito Centro",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(9), tipo: 'alerta' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(4), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000031"), id_cuenta: NumberInt(12), alias: "CIPHER_3", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-09T07:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000032"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Cuidado con eso.", fecha: ISODate("2026-10-08T03:45:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-07T18:45:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000033"),
    id_cuenta: NumberInt(11), alias: "MANTIS", rol: 'USUARIO',
    texto: "Se busca información sobre el informante del muelle 4. Recompensa alta.",
    etiquetas: ["puerto", "informantes"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(5), tipo: 'alerta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(2), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000034"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Yo también lo vi.", fecha: ISODate("2026-10-16T22:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000035"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-17T13:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000036"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-18T05:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000037"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Cuidado con eso.", fecha: ISODate("2026-10-17T06:00:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T19:00:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000038"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Las misiones de venganza no son para cualquiera. Lean bien antes de postularse.",
    etiquetas: ["venganza", "consejos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(9), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000039"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-19T07:56:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003a"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-19T00:56:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003b"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Gracias por el dato.", fecha: ISODate("2026-10-18T08:56:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-17T18:56:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000003c"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Hoy cerramos tres misiones en el Anillo Orbital. Buen ritmo, equipo.",
    etiquetas: ["anillo_orbital", "logros"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(20), tipo: 'alerta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000003d"), id_cuenta: NumberInt(11), alias: "MANTIS", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-10T14:34:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003e"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-10T18:34:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-10T12:34:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000003f"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "Cuidado con quien pide pagos por fuera de la plataforma, es estafa segura.",
    etiquetas: ["estafas", "alerta"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(19), tipo: 'fuego' }, { id_cuenta: NumberInt(20), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000040"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Gracias por el dato.", fecha: ISODate("2026-11-09T12:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000041"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-11-09T03:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000042"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-11-08T17:46:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-07T22:46:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000043"),
    id_cuenta: NumberInt(24), alias: "SABLE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien tiene repuestos para un dron de carga modelo K-12?",
    etiquetas: ["drones", "repuestos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(0), alerta: NumberInt(3) },
    reaccionaron: [{ id_cuenta: NumberInt(11), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'alerta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'alerta' }, { id_cuenta: NumberInt(20), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'alerta' }, { id_cuenta: NumberInt(19), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000044"), id_cuenta: NumberInt(12), alias: "CIPHER_3", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-30T07:55:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-29T21:55:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000045"),
    id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", rol: 'ADMINISTRADOR',
    texto: "La zona industrial necesita más protección nocturna. Hay trabajo para todos.",
    etiquetas: ["zona_industrial", "proteccion"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(6), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000046"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-16T03:59:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000047"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Yo también lo vi.", fecha: ISODate("2026-10-16T17:59:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000048"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Te escribo por privado.", fecha: ISODate("2026-10-16T13:59:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-15T09:59:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000049"),
    id_cuenta: NumberInt(2), alias: "MOD_SHADE", rol: 'ADMINISTRADOR',
    texto: "Mi taller fue saqueado anoche. Publicaré una misión de protección.",
    etiquetas: ["proteccion", "robos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(23), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(19), tipo: 'me_gusta' }, { id_cuenta: NumberInt(8), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000004a"), id_cuenta: NumberInt(2), alias: "MOD_SHADE", texto: "Gracias por el dato.", fecha: ISODate("2026-10-29T01:39:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000004b"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Eso no es cierto.", fecha: ISODate("2026-10-29T03:39:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000004c"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-28T00:39:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-27T11:39:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000004d"),
    id_cuenta: NumberInt(8), alias: "ZERO_DAY", rol: 'USUARIO',
    texto: "Busco equipo para una misión de sabotaje coordinada. Escríbanme por chat cuando asigne.",
    etiquetas: ["sabotaje", "equipo"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000004e"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Gracias por el dato.", fecha: ISODate("2026-10-26T06:20:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-25T17:20:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000004f"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Resumen de la semana: más misiones de escolta que nunca.",
    etiquetas: ["escolta", "estadisticas"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(0), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(19), tipo: 'me_gusta' }, { id_cuenta: NumberInt(24), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(5), tipo: 'alerta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000050"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-11T23:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000051"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Gracias por el dato.", fecha: ISODate("2026-10-11T16:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000052"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-13T03:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000053"), id_cuenta: NumberInt(14), alias: "ECHO_V", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-11T22:53:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-11T14:53:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000054"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "El puerto amaneció con niebla tóxica, eviten el muelle 2.",
    etiquetas: ["puerto", "alerta"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: NumberInt(6),
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(6), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000055"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Excelente aporte.", fecha: ISODate("2026-10-16T16:13:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000056"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Te escribo por privado.", fecha: ISODate("2026-10-16T18:13:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T09:13:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000057"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Gracias a todos por las calificaciones, ya llegué a reputación 4.5.",
    etiquetas: ["logros", "reputacion"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000058"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-11-04T14:32:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-03T14:32:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000059"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "Alguien recomienda una ruta segura entre suburbios y el centro?",
    etiquetas: ["suburbios", "rutas"],
    id_zona: NumberInt(4), zona: "Suburbios",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000005a"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Excelente aporte.", fecha: ISODate("2026-10-17T03:29:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005b"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-16T21:29:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T14:29:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("665f1c2a9b3e4d0012ab34cd"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "Publico datos de contacto de un jugador que me estafó: (eliminado por moderación)",
    etiquetas: ["estafas"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(15), tipo: 'fuego' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000005c"), id_cuenta: NumberInt(21), alias: "VIPER_Q", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-27T13:05:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005d"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-27T12:05:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005e"), id_cuenta: NumberInt(11), alias: "MANTIS", texto: "Gracias por el dato.", fecha: ISODate("2026-10-26T16:05:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'OCULTA',
    fecha_publicacion: ISODate("2026-10-25T22:05:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000005f"),
    id_cuenta: NumberInt(16), alias: "RONIN_X", rol: 'CAZARRECOMPENSAS',
    texto: "Novedades: las recargas de créditos ya están funcionando bien otra vez.",
    etiquetas: ["pagos", "novedades"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(3), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'fuego' }, { id_cuenta: NumberInt(3), tipo: 'fuego' }, { id_cuenta: NumberInt(14), tipo: 'fuego' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T14:13:00.000Z"),
    fecha_edicion: null
  }
]);

db.mensajes_chat.insertMany([
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-06T18:27:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Recibido, ya revisé la zona.", fecha: ISODate("2026-10-06T19:42:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-06T20:53:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-06T21:45:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-06T22:51:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-07T17:18:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-07T18:11:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-07T18:16:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-07T19:37:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-07T20:10:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-08T17:54:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-08T18:03:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-08T18:31:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-08T19:22:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-08T19:37:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-08T20:12:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-08T20:58:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-09T18:08:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-09T19:17:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-09T19:32:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-09T20:31:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-09T21:56:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-09T23:09:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-10T00:37:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-10T00:45:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-10T17:52:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-10T18:16:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-10T19:22:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-10T20:43:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-10T20:53:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-11T17:56:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-11T19:06:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-11T20:25:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-11T21:14:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-11T21:53:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-11T23:19:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-12T00:33:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-12T17:40:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-12T17:44:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-12T18:18:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-12T18:26:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-12T18:49:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-12T20:19:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-12T20:28:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-12T21:21:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-12T22:38:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-13T17:12:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-13T17:43:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-13T18:47:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-13T19:21:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-13T20:30:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-13T21:32:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-14T17:34:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-14T17:51:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-14T19:13:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-14T20:14:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-14T20:43:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-14T20:52:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-14T22:02:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-14T22:20:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-14T23:19:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-15T00:47:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-15T18:19:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-15T19:43:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-15T21:13:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-15T22:02:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-15T23:12:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-15T23:32:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-15T23:51:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T17:17:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-16T17:59:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T19:06:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-16T19:54:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T20:31:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-16T22:01:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-16T23:16:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-17T17:27:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-17T18:05:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-17T18:38:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-17T19:12:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-17T20:38:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-17T22:08:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-17T23:31:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-17T23:35:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-18T17:57:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-18T19:19:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-18T19:35:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-18T20:47:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-18T20:59:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-18T21:13:00.000Z"), leido: true },
  { id_mision: NumberInt(14), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-19T18:13:00.000Z"), leido: false },
  { id_mision: NumberInt(15), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-20T17:50:00.000Z"), leido: true },
  { id_mision: NumberInt(15), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-20T18:54:00.000Z"), leido: true },
  { id_mision: NumberInt(15), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-20T19:23:00.000Z"), leido: false },
  { id_mision: NumberInt(16), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-21T18:06:00.000Z"), leido: true },
  { id_mision: NumberInt(16), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-21T18:26:00.000Z"), leido: false }
]);

db.bitacora_actividad.insertMany([
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T11:28:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-18T22:27:00.000Z"), id_mision: NumberInt(13) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-14T19:09:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-23T13:27:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-03T18:05:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(12) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-09T17:13:00.000Z"), id_cuenta_vista: NumberInt(24) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-24T23:46:00.000Z"), id_mision: NumberInt(11) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-14T15:22:00.000Z"), id_mision: NumberInt(11) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-12T18:45:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(3) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T15:05:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-30T20:50:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-29T12:53:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-06T15:33:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-06T21:04:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(1), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(1) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-10T08:40:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-01T15:45:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-26T22:25:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-13T23:31:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-27T08:51:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-05T11:26:00.000Z"), id_cuenta_vista: NumberInt(17) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-15T20:43:00.000Z"), exito: true },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T17:17:00.000Z"), id_cuenta_vista: NumberInt(15) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-24T11:19:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-11-03T08:37:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-20T23:38:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-21T23:56:00.000Z"), pantalla: 'mercado', filtros: {  }, resultados: NumberInt(1) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T20:03:00.000Z"), exito: true },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-29T16:50:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-11-04T19:28:00.000Z"), id_mision: NumberInt(23) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-15T21:10:00.000Z"), id_mision: NumberInt(5) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-07T12:40:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-07T09:09:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-27T16:39:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T10:47:00.000Z"), pantalla: 'mercado', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-11-02T14:02:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(5) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-30T10:35:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-09T19:04:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T11:41:00.000Z"), pantalla: 'mercado', filtros: {  }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T22:49:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-18T12:18:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(12) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T16:12:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-24T16:36:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-11T12:43:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(2), id_especialidad: NumberInt(4) }, resultados: NumberInt(1) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-19T09:10:00.000Z"), id_cuenta_vista: NumberInt(21) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T18:58:00.000Z"), id_mision: NumberInt(17) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-18T12:52:00.000Z"), id_mision: NumberInt(16) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-31T08:46:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(0) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-26T14:21:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T14:32:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-15T16:49:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2), id_especialidad: NumberInt(5) }, resultados: NumberInt(9) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-17T14:36:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-10T12:15:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(1) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-13T15:57:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(3), texto: "drones" }, resultados: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-12T08:18:00.000Z"), id_mision: NumberInt(12) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-28T13:11:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-24T20:39:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(0) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-11-07T20:07:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2) }, resultados: NumberInt(5) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-07T12:25:00.000Z"), id_cuenta_vista: NumberInt(24) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-04T19:26:00.000Z"), id_mision: NumberInt(23) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T17:31:00.000Z"), id_mision: NumberInt(15) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T21:07:00.000Z"), pantalla: 'mercado', filtros: { id_especialidad: NumberInt(5) }, resultados: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-25T09:18:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-29T18:48:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-20T11:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(1) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-20T17:42:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(10) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-31T13:14:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T10:06:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4), texto: "escolta" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-06T18:11:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T20:09:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-24T08:29:00.000Z"), id_mision: NumberInt(10) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-11-05T12:59:00.000Z"), id_mision: NumberInt(16) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-17T17:54:00.000Z"), id_cuenta_vista: NumberInt(15) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-25T19:57:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(0) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-11T17:46:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T12:21:00.000Z"), id_mision: NumberInt(15) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T13:14:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-17T16:11:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-22T19:51:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T15:19:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T16:08:00.000Z"), id_mision: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T22:58:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(5), texto: "drones" }, resultados: NumberInt(6) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-10T13:18:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-16T16:46:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(7) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-29T08:59:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-09T19:20:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-23T13:38:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-01T15:42:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-05T15:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(1) }, resultados: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-14T08:38:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(0) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-12T13:36:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-20T12:03:00.000Z"), exito: false },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-11-07T16:48:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(7) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-03T09:20:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-07T12:31:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-14T22:33:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-20T21:56:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4) }, resultados: NumberInt(0) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T17:16:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T10:59:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-18T09:10:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-03T20:59:00.000Z"), id_mision: NumberInt(13) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-08T14:26:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-15T23:13:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(4) }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-05T14:34:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-21T20:36:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-11T19:03:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-13T15:46:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-25T20:28:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-21T09:19:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(5) }, resultados: NumberInt(0) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-24T21:27:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T12:56:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-02T20:08:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-11T17:23:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-06T23:36:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-24T10:58:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-12T19:15:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-11-01T11:25:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-11-04T13:22:00.000Z"), id_mision: NumberInt(8) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T18:58:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(5), texto: "muelle" }, resultados: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-28T10:58:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-21T10:01:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-24T16:52:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T20:39:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-18T10:40:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T10:17:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T20:02:00.000Z"), id_mision: NumberInt(22) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-22T17:31:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-17T16:14:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-05T20:00:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T18:16:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-18T20:43:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-15T18:39:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-28T21:18:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), id_especialidad: NumberInt(2) }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-06T12:56:00.000Z"), exito: false },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-24T11:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T09:22:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-30T16:45:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(2) }, resultados: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T12:39:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-15T12:12:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(7) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-13T16:44:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T20:59:00.000Z"), id_mision: NumberInt(5) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-15T11:55:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-12T20:21:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T13:23:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-23T15:25:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-14T20:43:00.000Z"), id_mision: NumberInt(18) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-14T22:11:00.000Z"), id_mision: NumberInt(18) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-05T21:07:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-14T16:40:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-14T10:00:00.000Z"), id_mision: NumberInt(10) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T08:11:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-17T21:30:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T09:13:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2) }, resultados: NumberInt(3) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-11-02T09:11:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T10:17:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-09T22:00:00.000Z"), id_mision: NumberInt(3) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-05T16:51:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T17:51:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(11) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-21T08:00:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-28T22:22:00.000Z"), exito: false },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-25T11:16:00.000Z"), exito: true }
]);

print('publicaciones: ' + db.publicaciones.countDocuments());
print('mensajes_chat: ' + db.mensajes_chat.countDocuments());
print('bitacora_actividad: ' + db.bitacora_actividad.countDocuments());
```

</div>

<a href="/bases-2/bountyline/fase-2/02_insercion.js" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>03_usuarios.js</summary>

<div class="evidence-code">

```javascript
// =====================================================================
// BountyLine - MongoDB: usuarios
//   bountyline_admin: administrador del servidor (rol root).
//   bountyline_app:   la aplicación; solo lee y escribe en la base bountyline.
// Se ejecuta antes de activar la autenticación (security.authorization).
// Ejecutar con: mongosh 03_usuarios.js
// =====================================================================
const admin = db.getSiblingDB('admin');

for (const u of ['bountyline_admin', 'bountyline_app']) {
  if (admin.getUser(u)) {
    admin.dropUser(u);
  }
}

admin.createUser({
  user: 'bountyline_admin',
  pwd: '<CONTRASENA_LOCAL>',
  roles: [{ role: 'root', db: 'admin' }]
});

admin.createUser({
  user: 'bountyline_app',
  pwd: '<CONTRASENA_LOCAL>',
  roles: [{ role: 'readWrite', db: 'bountyline' }]
});

print('Usuarios: ' + admin.getUsers().users.map(u => u.user).join(', '));
```

</div>

<a href="/bases-2/bountyline/fase-2/03_usuarios.js" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

<details class="evidence-drop">
<summary>04_consultas.js</summary>

<div class="evidence-code">

```javascript
// =====================================================================
// BountyLine - MongoDB: consultas de ejemplo
// CRUD, consultas con filtros combinados y proyección, y agregaciones con
// $match, $unwind, $group, $sort y $lookup (propuesta, sección 6.2).
// Ejecutar con: mongosh -u bountyline_admin -p --authenticationDatabase admin 04_consultas.js
// =====================================================================
use('bountyline');
const titulo = t => print('\n== ' + t);

// ------------------------------- CRUD --------------------------------
titulo('Crear una publicación');
const nueva = db.publicaciones.insertOne({
  id_cuenta: NumberInt(3), alias: 'AXIOM_47', rol: 'USUARIO',
  texto: 'Publicación de prueba creada desde el script de consultas.',
  etiquetas: ['prueba'], id_zona: NumberInt(1), zona: 'Distrito Centro', id_mision: null,
  reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
  reaccionaron: [], comentarios: [], estado_moderacion: 'VISIBLE',
  fecha_publicacion: new Date(), fecha_edicion: null
});
printjson(nueva);

titulo('Agregar un comentario y una reacción (sin repetir la reacción de la misma cuenta)');
db.publicaciones.updateOne(
  { _id: nueva.insertedId },
  { $push: { comentarios: { _id: new ObjectId(), id_cuenta: NumberInt(15), alias: 'VANTA_K',
                            texto: 'Comentario de prueba.', fecha: new Date(), estado_moderacion: 'VISIBLE' } } }
);
db.publicaciones.updateOne(
  { _id: nueva.insertedId, 'reaccionaron.id_cuenta': { $ne: NumberInt(15) } },
  { $push: { reaccionaron: { id_cuenta: NumberInt(15), tipo: 'fuego' } }, $inc: { 'reacciones.fuego': NumberInt(1) } }
);
printjson(db.publicaciones.findOne({ _id: nueva.insertedId }, { texto: 1, reacciones: 1, comentarios: 1 }));

titulo('Editar el texto');
db.publicaciones.updateOne({ _id: nueva.insertedId },
  { $set: { texto: 'Publicación de prueba (editada).', fecha_edicion: new Date() } });

titulo('Moderación: ocultar el comentario reportado en MySQL (reporte 4)');
db.publicaciones.updateOne(
  { 'comentarios._id': ObjectId('665f1c2a9b3e4d0012ab34d1') },
  { $set: { 'comentarios.$.estado_moderacion': 'OCULTO' } }
);

titulo('Borrar la publicación de prueba');
printjson(db.publicaciones.deleteOne({ _id: nueva.insertedId }));

// ------------------------- Consultas con filtros ---------------------
titulo('Feed: publicaciones visibles de una zona con alguna de dos etiquetas, en un rango de fechas');
db.publicaciones.find(
  { estado_moderacion: 'VISIBLE', id_zona: NumberInt(2), etiquetas: { $in: ['alerta', 'contrabando'] },
    fecha_publicacion: { $gte: ISODate('2026-10-01'), $lt: ISODate('2026-12-01') } },
  { _id: 0, alias: 1, texto: 1, etiquetas: 1, fecha_publicacion: 1, total_comentarios: { $size: '$comentarios' } }
).sort({ fecha_publicacion: -1 }).forEach(printjson);

titulo('Búsqueda de texto: "puerto alerta"');
db.publicaciones.find(
  { $text: { $search: 'puerto alerta' }, estado_moderacion: 'VISIBLE' },
  { _id: 0, alias: 1, texto: 1, puntaje: { $meta: 'textScore' } }
).sort({ puntaje: { $meta: 'textScore' } }).limit(5).forEach(printjson);

titulo('Chat de la misión 11, en orden');
db.mensajes_chat.find({ id_mision: NumberInt(11) }, { _id: 0, alias_emisor: 1, texto: 1, fecha: 1 })
  .sort({ fecha: 1 }).forEach(printjson);

titulo('Mensajes sin leer por misión');
db.mensajes_chat.aggregate([
  { $match: { leido: false } },
  { $group: { _id: '$id_mision', sin_leer: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).forEach(printjson);

// ---------------------------- Agregaciones ---------------------------
titulo('Etiquetas más usadas por zona');
db.publicaciones.aggregate([
  { $match: { estado_moderacion: 'VISIBLE', id_zona: { $ne: null } } },
  { $unwind: '$etiquetas' },
  { $group: { _id: { zona: '$zona', etiqueta: '$etiquetas' }, usos: { $sum: 1 } } },
  { $sort: { '_id.zona': 1, usos: -1 } },
  { $group: { _id: '$_id.zona', etiquetas: { $push: { etiqueta: '$_id.etiqueta', usos: '$usos' } } } },
  { $project: { _id: 0, zona: '$_id', top3: { $slice: ['$etiquetas', 3] } } },
  { $sort: { zona: 1 } }
]).forEach(printjson);

titulo('Publicaciones por semana');
db.publicaciones.aggregate([
  { $group: { _id: { anio: { $isoWeekYear: '$fecha_publicacion' }, semana: { $isoWeek: '$fecha_publicacion' } },
              publicaciones: { $sum: 1 }, comentarios: { $sum: { $size: '$comentarios' } } } },
  { $sort: { '_id.anio': 1, '_id.semana': 1 } }
]).forEach(printjson);

titulo('Cantidad promedio de mensajes por misión');
db.mensajes_chat.aggregate([
  { $group: { _id: '$id_mision', mensajes: { $sum: 1 } } },
  { $group: { _id: null, misiones_con_chat: { $sum: 1 }, promedio: { $avg: '$mensajes' }, maximo: { $max: '$mensajes' } } },
  { $project: { _id: 0, misiones_con_chat: 1, promedio: { $round: ['$promedio', 2] }, maximo: 1 } }
]).forEach(printjson);

titulo('Filtros de búsqueda más usados');
db.bitacora_actividad.aggregate([
  { $match: { tipo: 'BUSQUEDA' } },
  { $project: { pantalla: 1, filtro: { $objectToArray: '$filtros' } } },
  { $unwind: '$filtro' },
  { $group: { _id: { pantalla: '$pantalla', filtro: '$filtro.k' }, veces: { $sum: 1 } } },
  { $sort: { veces: -1 } }
]).forEach(printjson);

titulo('$lookup: misiones mencionadas en publicaciones junto con la cantidad de mensajes de su chat');
db.publicaciones.aggregate([
  { $match: { id_mision: { $ne: null } } },
  { $lookup: { from: 'mensajes_chat', localField: 'id_mision', foreignField: 'id_mision', as: 'chat' } },
  { $project: { _id: 0, id_mision: 1, alias: 1, texto: 1, mensajes_chat: { $size: '$chat' } } },
  { $sort: { mensajes_chat: -1 } }
]).forEach(printjson);

titulo('Actividad por tipo de evento y día de la semana');
db.bitacora_actividad.aggregate([
  { $group: { _id: { tipo: '$tipo', dia: { $dayOfWeek: '$fecha' } }, eventos: { $sum: 1 } } },
  { $sort: { '_id.tipo': 1, '_id.dia': 1 } }
]).forEach(printjson);
```

</div>

<a href="/bases-2/bountyline/fase-2/04_consultas.js" download style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Descargar script
</a>

</details>

## Respaldo y recuperación

<details class="evidence-drop">
<summary>Políticas de respaldo</summary>

<iframe title="Políticas de respaldo" src="/bases-2/bountyline/fase-2/politicas-de-respaldo.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/politicas-de-respaldo.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

<details class="evidence-drop">
<summary>Plan de recuperación ante desastres</summary>

<iframe title="Plan de recuperación ante desastres" src="/bases-2/bountyline/fase-2/plan-de-recuperacion-ante-desastres.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/plan-de-recuperacion-ante-desastres.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

## Demostración y repositorio

<details class="evidence-drop">
<summary>Documento de enlaces del equipo</summary>

<iframe title="Documento de enlaces del equipo" src="/bases-2/bountyline/fase-2/documento-de-enlaces-del-equipo.pdf#view=FitH" loading="lazy" class="evidence-pdf"></iframe>

<a href="/bases-2/bountyline/fase-2/documento-de-enlaces-del-equipo.pdf" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Abrir PDF completo
</a>

</details>

## BountyLine en funcionamiento

<div class="evidence-video"><iframe title="Demostración de BountyLine" loading="lazy" src="https://www.youtube-nocookie.com/embed/qVt9Vf7JouA" allowfullscreen></iframe></div>

<a href="https://youtu.be/qVt9Vf7JouA" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Ver en YouTube
</a>

<a href="https://github.com/gabGABY006/BountyLine" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.7rem 1.2rem; background: #f472b6; color: white; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
  Repositorio del proyecto
</a>
