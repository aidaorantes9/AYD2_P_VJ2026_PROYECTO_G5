-- Módulo de certificación y auditoría de la PRCCD
CREATE DATABASE IF NOT EXISTS prccd
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prccd;

-- Certificados digitales emitidos a candidatos aprobados
CREATE TABLE IF NOT EXISTS Certificado (
    id_certificado BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_candidato BIGINT NOT NULL,
    id_evaluacion BIGINT NULL,
    codigo_verificacion CHAR(36) NOT NULL,
    hash_certificado CHAR(64) NOT NULL,
    algoritmo_hash VARCHAR(20) NOT NULL DEFAULT 'SHA-256',
    firma_electronica TEXT NOT NULL,
    clave_publica TEXT NULL,
    datos_certificado JSON NOT NULL,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion TIMESTAMP NULL,
    estado ENUM('emitido', 'revocado') NOT NULL DEFAULT 'emitido',

    INDEX idx_certificado_candidato (id_candidato),
    INDEX idx_certificado_estado (estado),

    CONSTRAINT uq_certificado_codigo
        UNIQUE (codigo_verificacion),

    CONSTRAINT uq_certificado_hash
        UNIQUE (hash_certificado),

    CONSTRAINT fk_certificado_candidato
        FOREIGN KEY (id_candidato)
        REFERENCES Candidato(id_candidato)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Registro append-only de eventos relacionados con los certificados
CREATE TABLE IF NOT EXISTS BitacoraAuditoria (
    id_evento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_certificado BIGINT NOT NULL,
    tipo_evento ENUM(
        'EMISION',
        'VERIFICACION',
        'REVOCACION',
        'DETECCION_FRAUDE'
    ) NOT NULL,
    actor VARCHAR(120) NOT NULL,
    detalle_evento JSON NOT NULL,
    hash_anterior CHAR(64) NULL,
    hash_evento CHAR(64) NOT NULL,
    firma_evento TEXT NOT NULL,
    resultado_validacion ENUM(
        'VALIDO',
        'INVALIDO',
        'NO_APLICA'
    ) NOT NULL DEFAULT 'NO_APLICA',
    fecha_evento TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX idx_bitacora_certificado_fecha (id_certificado, fecha_evento),
    INDEX idx_bitacora_tipo_evento (tipo_evento),

    CONSTRAINT uq_bitacora_hash
        UNIQUE (hash_evento),

    CONSTRAINT fk_bitacora_certificado
        FOREIGN KEY (id_certificado)
        REFERENCES Certificado(id_certificado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- Protección append-only de la bitácora inmutable
DROP TRIGGER IF EXISTS trg_bitacora_bloquear_update;
DROP TRIGGER IF EXISTS trg_bitacora_bloquear_delete;

DELIMITER $$

CREATE TRIGGER trg_bitacora_bloquear_update
BEFORE UPDATE ON BitacoraAuditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La bitácora de auditoría es inmutable y no permite modificaciones';
END$$

CREATE TRIGGER trg_bitacora_bloquear_delete
BEFORE DELETE ON BitacoraAuditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La bitácora de auditoría es inmutable y no permite eliminaciones';
END$$

DELIMITER ;


ALTER TABLE Certificado
ADD CONSTRAINT uq_certificado_evaluacion
UNIQUE (id_evaluacion);