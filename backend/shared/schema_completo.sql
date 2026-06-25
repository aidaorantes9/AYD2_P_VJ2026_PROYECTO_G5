-- =============================================================================
-- SCHEMA COMPLETO - PRCCD (Plataforma de Registro y Certificación de Competencias Digitales)
-- =============================================================================
-- Orden de creación basado en dependencias de llaves foráneas:
--   1. sm-seguridad       → CandidatoSeguridad (independiente)
--   2. dev2-integracion   → Pais, Universidad, Carrera, IngestaDatosAcademicos, Candidato, HistorialAcademico
--   3. dev1-evaluaciones  → PeriodoCertificacion, InscripcionPeriodo, Competencia, Pregunta,
--                           OpcionRespuesta, Evaluacion, RespuestaEvaluacion
--   4. dev4-antifraude    → EvidenciaAntifraude, DeteccionFraude, MetricaAgregada
--   5. certificacion-auditoria → Certificado, BitacoraAuditoria (+ triggers)
-- =============================================================================

-- Crea la base de datos del proyecto si no existe
-- Selecciona la base de datos del proyecto
-- =============================================================================
-- MÓDULO: sm-seguridad
-- =============================================================================

CREATE TABLE IF NOT EXISTS CandidatoSeguridad (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado  VARBINARY(255) NOT NULL,
    estado_gdpr    ENUM('activo', 'anonimizado', 'olvidado') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id)
);

-- =============================================================================
-- MÓDULO: dev2-integracion
-- =============================================================================

-- Catálogo de países de la región
CREATE TABLE IF NOT EXISTS Pais (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_iso CHAR(2) NOT NULL
) ENGINE=InnoDB;

-- Universidades integradas al sistema
CREATE TABLE IF NOT EXISTS Universidad (
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
CREATE TABLE IF NOT EXISTS Carrera (
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
CREATE TABLE IF NOT EXISTS IngestaDatosAcademicos (
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
CREATE TABLE IF NOT EXISTS Candidato (
    id_candidato BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pais INT NULL,
    id_carrera INT NULL,
    id_universidad INT NULL,
    id_ingesta BIGINT NULL,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado VARBINARY(255) NOT NULL,
    -- voy a agregar una columna para la contrasenia del candidato, esto no se hace tan asi pero si lo dejare asi porque pues ni modo va asi tocara hacerlo y ya esta 
    contrasenia VARCHAR(100) NOT NULL,
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
CREATE TABLE IF NOT EXISTS HistorialAcademico (
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

-- =============================================================================
-- MÓDULO: dev1-evaluaciones
-- =============================================================================

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

-- =============================================================================
-- MÓDULO: dev4-antifraude
-- =============================================================================

CREATE TABLE IF NOT EXISTS EvidenciaAntifraude (
    id_evidencia          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_evaluacion         INT NOT NULL,
    tipo_evidencia        ENUM(
        'captura',
        'log_tecleo',
        'video'
    ) NOT NULL,
    uri_almacenamiento    VARCHAR(255) NOT NULL,
    hash_sha256           CHAR(64) DEFAULT NULL,
    algoritmo_cifrado     VARCHAR(30) DEFAULT NULL,
    timestamp_captura     DATETIME NOT NULL,
    fecha_retencion_hasta DATE DEFAULT NULL,
    inmutable             TINYINT(1) NOT NULL DEFAULT 1,
    creado_en             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_evidencia),

    INDEX idx_evidencia_evaluacion (
        id_evaluacion
    ),

    CONSTRAINT fk_evidencia_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS DeteccionFraude (
    id_deteccion      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_evaluacion     INT NOT NULL,
    id_evidencia      BIGINT UNSIGNED NOT NULL,
    tipo_indicio      VARCHAR(60) NOT NULL,
    descripcion       TEXT DEFAULT NULL,
    severidad         ENUM(
        'baja',
        'media',
        'alta',
        'critica'
    ) NOT NULL DEFAULT 'media',
    estado_revision   ENUM(
        'pendiente',
        'confirmado',
        'descartado'
    ) NOT NULL DEFAULT 'pendiente',
    fecha_deteccion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_deteccion),

    INDEX idx_deteccion_evaluacion (
        id_evaluacion
    ),

    INDEX idx_deteccion_evidencia (
        id_evidencia
    ),

    CONSTRAINT fk_deteccion_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_deteccion_evidencia
        FOREIGN KEY (id_evidencia)
        REFERENCES EvidenciaAntifraude(id_evidencia)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS MetricaAgregada (
    id_metrica          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_competencia      INT DEFAULT NULL,
    id_pais             INT DEFAULT NULL,
    id_carrera          INT DEFAULT NULL,
    id_periodo          INT DEFAULT NULL,
    carrera_segmento    VARCHAR(120) NOT NULL,
    genero_segmento     VARCHAR(20) NOT NULL,
    total_evaluaciones  INT NOT NULL DEFAULT 0,
    total_aprobados     INT NOT NULL DEFAULT 0,
    tasa_aprobacion     DECIMAL(5,2) NOT NULL DEFAULT 0,
    anonimizada         TINYINT(1) NOT NULL DEFAULT 1,
    fecha_calculo       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_metrica),

    INDEX idx_metrica_segmentos (
        id_pais,
        id_carrera,
        genero_segmento
    ),

    CONSTRAINT fk_metrica_competencia
        FOREIGN KEY (id_competencia)
        REFERENCES Competencia(id_competencia)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_metrica_pais
        FOREIGN KEY (id_pais)
        REFERENCES Pais(id_pais)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_metrica_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES Carrera(id_carrera)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_metrica_periodo
        FOREIGN KEY (id_periodo)
        REFERENCES PeriodoCertificacion(id_periodo)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE = InnoDB;

-- =============================================================================
-- MÓDULO: certificacion-auditoria
-- =============================================================================

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

    CONSTRAINT uq_certificado_evaluacion
        UNIQUE (id_evaluacion),

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
