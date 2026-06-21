-- Crea la base de datos del proyecto si no existe
CREATE DATABASE IF NOT EXISTS prccd
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Selecciona la base de datos del proyecto
USE prccd;

-- Desactiva temporalmente las llaves foráneas para eliminar tablas sin errores
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS EvidenciaAntifraude;
DROP TABLE IF EXISTS DeteccionFraude;
DROP TABLE IF EXISTS MetricaAgregada;

-- Reactiva la validación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE EvidenciaAntifraude (
    id_evidencia          BIGINT UNSIGNED                       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion         BIGINT UNSIGNED                       NOT NULL,
    tipo_evidencia        ENUM('captura','log_tecleo','video')      NOT NULL,
    uri_almacenamiento    VARCHAR(255)                          NOT NULL,
    hash_sha256           CHAR(64)                              DEFAULT NULL,
    algoritmo_cifrado     VARCHAR(30)                           DEFAULT NULL,
    timestamp_captura     DATETIME                              NOT NULL,
    fecha_retencion_hasta DATE                                  DEFAULT NULL,
    inmutable             TINYINT(1)                            NOT NULL DEFAULT 0,
    creado_en             DATETIME                              NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_evidencia_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB 

CREATE TABLE DeteccionFraude (
    id_deteccion        BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion       BIGINT UNSIGNED   NOT NULL,
    id_evidencia        BIGINT UNSIGNED   NOT NULL,
    tipo_indicio        VARCHAR(60)       NOT NULL,
    descripcion         TEXT              DEFAULT NULL,
    severidad           VARCHAR(20)       NOT NULL,
    estado_revision     VARCHAR(20)       NOT NULL,
    fecha_deteccion     DATETIME          NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_deteccion_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE

    CONSTRAINT fk_deteccion_evidencia
        FOREIGN KEY (id_evidencia)
        REFERENCES EvidenciaAntifraude(id_evidencia)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS MetricaAgregada (
    id_metrica          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,

    id_competencia      INT DEFAULT NULL,
    id_pais             INT DEFAULT NULL, 
    id_carrera          INT DEFAULT NULL, 
    id_periodo          INT DEFAULT NULL,

    carrera_segmento    VARCHAR(120) NOT NULL,
    genero_segmento     VARCHAR(20) NOT NULL,

    total_evaluaciones  INT NOT NULL,
    total_aprobados     INT NOT NULL,
    tasa_aprobacion     DECIMAL(5,2) NOT NULL,

    anonimizada         TINYINT(1) NOT NULL DEFAULT 1,
    fecha_calculo       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_metrica_competencia
        FOREIGN KEY (id_competencia)
        REFERENCES Competencia(id_competencia)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_metrica_periodo
        FOREIGN KEY (id_periodo)
        REFERENCES PeriodoCertificacion(id_periodo)
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
        ON DELETE SET NULL
) ENGINE=InnoDB;
