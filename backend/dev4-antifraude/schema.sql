CREATE DATABASE IF NOT EXISTS prccd
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE prccd;

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

