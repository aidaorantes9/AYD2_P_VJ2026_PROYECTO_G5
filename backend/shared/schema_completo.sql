-- Crea la base de datos del proyecto si no existe
CREATE DATABASE IF NOT EXISTS prccd
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Selecciona la base de datos del proyecto
USE prccd;

-- Desactiva temporalmente las llaves foráneas para eliminar tablas sin errores
SET FOREIGN_KEY_CHECKS = 0;

-- Elimina las tablas del módulo Dev 2 si ya existen
DROP TABLE IF EXISTS HistorialAcademico;
DROP TABLE IF EXISTS Candidato;
DROP TABLE IF EXISTS IngestaDatosAcademicos;
DROP TABLE IF EXISTS Carrera;
DROP TABLE IF EXISTS Universidad;
DROP TABLE IF EXISTS Pais;

-- Reactiva la validación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Catálogo de países de la región
CREATE TABLE Pais (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_iso CHAR(2) NOT NULL
) ENGINE=InnoDB;

-- Universidades integradas al sistema
CREATE TABLE Universidad (
    id_universidad INT AUTO_INCREMENT PRIMARY KEY,
    id_pais INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    protocolo_auth ENUM('LDAP', 'SAML', 'OAuth2') NOT NULL,
    formato_datos ENUM('JSON', 'XML', 'CSV') NOT NULL,
    endpoint_api VARCHAR(255) NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_universidad_pais
        FOREIGN KEY (id_pais)
        REFERENCES Pais(id_pais)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Carreras asociadas a una universidad
CREATE TABLE Carrera (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_universidad INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,

    CONSTRAINT fk_carrera_universidad
        FOREIGN KEY (id_universidad)
        REFERENCES Universidad(id_universidad)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Registro de procesos de ingesta académica
CREATE TABLE IngestaDatosAcademicos (
    id_ingesta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_universidad INT NOT NULL,
    formato_datos ENUM('JSON', 'XML', 'CSV') NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    registros_procesados INT NOT NULL DEFAULT 0,
    registros_rechazados INT NOT NULL DEFAULT 0,
    detalle_errores TEXT NULL,
    fecha_ingesta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ingesta_universidad
        FOREIGN KEY (id_universidad)
        REFERENCES Universidad(id_universidad)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Candidatos importados desde las universidades
CREATE TABLE Candidato (
    id_candidato BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pais INT NULL,
    id_carrera INT NULL,
    id_universidad INT NULL,
    id_ingesta BIGINT NULL,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado VARBINARY(255) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    id_externo_univ VARCHAR(80) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_gdpr ENUM('activo', 'anonimizado', 'olvidado') NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_candidato_pais
        FOREIGN KEY (id_pais)
        REFERENCES Pais(id_pais)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_candidato_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES Carrera(id_carrera)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_candidato_universidad
        FOREIGN KEY (id_universidad)
        REFERENCES Universidad(id_universidad)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_candidato_ingesta
        FOREIGN KEY (id_ingesta)
        REFERENCES IngestaDatosAcademicos(id_ingesta)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Historial académico normalizado de cada candidato
-- RECORDATORIO: ESTA TABLA ES NUEVA NO APARECE EN EL DIAGRAMA ORIGINAL, SE CREA PARA ALMACENAR LOS CURSOS Y NOTAS DE CADA CANDIDATO DE FORMA NORMALIZADA
CREATE TABLE HistorialAcademico (
    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_candidato BIGINT NOT NULL,
    codigo_curso VARCHAR(50) NOT NULL,
    nombre_curso VARCHAR(150) NOT NULL,
    nota_final DECIMAL(5,2) NOT NULL,

    CONSTRAINT fk_historial_candidato
        FOREIGN KEY (id_candidato)
        REFERENCES Candidato(id_candidato)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PeriodoCertificacion (
  id_periodo        INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE NOT NULL,
  activo            BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS InscripcionPeriodo (
  id_inscripcion    INT AUTO_INCREMENT PRIMARY KEY,
  id_candidato      BIGINT NOT NULL,
  id_periodo        INT NOT NULL,
  fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_candidato, id_periodo),
  FOREIGN KEY (id_periodo) REFERENCES PeriodoCertificacion(id_periodo)
);

CREATE TABLE IF NOT EXISTS Competencia (
  id_competencia    INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  descripcion       TEXT
);

CREATE TABLE IF NOT EXISTS Pregunta (
  id_pregunta       INT AUTO_INCREMENT PRIMARY KEY,
  id_competencia    INT NOT NULL,
  enunciado         TEXT NOT NULL,
  nivel_dificultad  ENUM('Basico', 'Intermedio', 'Avanzado') NOT NULL,
  activa            BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_competencia) REFERENCES Competencia(id_competencia)
);

CREATE TABLE IF NOT EXISTS OpcionRespuesta (
  id_opcion         INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta       INT NOT NULL,
  texto_opcion      TEXT NOT NULL,
  es_correcta       BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta)
);

CREATE TABLE IF NOT EXISTS Evaluacion (
  id_evaluacion     INT AUTO_INCREMENT PRIMARY KEY,
  id_candidato      BIGINT NOT NULL,
  id_competencia    INT NOT NULL,
  id_periodo        INT NOT NULL,
  calificacion      DECIMAL(5,2) DEFAULT NULL,
  estado            ENUM('pendiente','en_progreso','finalizada') DEFAULT 'pendiente',
  aprobada          BOOLEAN DEFAULT FALSE,
  fecha_inicio      DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_fin         DATETIME DEFAULT NULL,
  FOREIGN KEY (id_competencia) REFERENCES Competencia(id_competencia),
  FOREIGN KEY (id_periodo)     REFERENCES PeriodoCertificacion(id_periodo)
);

CREATE TABLE IF NOT EXISTS RespuestaEvaluacion (
  id_respuesta          INT AUTO_INCREMENT PRIMARY KEY,
  id_evaluacion         INT NOT NULL,
  id_pregunta           INT NOT NULL,
  id_opcion_seleccionada INT,
  dificultad_presentada ENUM('Basico', 'Intermedio', 'Avanzado') NOT NULL,
  es_correcta           BOOLEAN DEFAULT FALSE,
  tiempo_respuesta_ms   INT DEFAULT NULL,
  orden_secuencia       INT NOT NULL,
  FOREIGN KEY (id_evaluacion) REFERENCES Evaluacion(id_evaluacion),
  FOREIGN KEY (id_pregunta)   REFERENCES Pregunta(id_pregunta)
);



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


CREATE DATABASE IF NOT EXISTS prccd;
USE prccd;

CREATE TABLE IF NOT EXISTS CandidatoSeguridad (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado  VARBINARY(255) NOT NULL,
    estado_gdpr    ENUM('activo', 'anonimizado', 'olvidado') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id)
);


