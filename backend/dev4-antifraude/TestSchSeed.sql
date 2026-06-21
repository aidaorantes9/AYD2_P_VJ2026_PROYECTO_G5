-- ==========================================
-- CREAR Y USAR BASE DE DATOS
-- ==========================================

DROP DATABASE IF EXISTS Testing;
CREATE DATABASE Testing;
USE Testing;

-- ==========================================
-- TABLAS SIN DEPENDENCIAS
-- ==========================================

CREATE TABLE IF NOT EXISTS Competencia (
    id_competencia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PeriodoCertificacion (
    id_periodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Evaluacion (
    id_evaluacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    detalle VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE Pais (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_iso CHAR(2) NOT NULL
) ENGINE=InnoDB;

-- ==========================================
-- TABLAS DEPENDIENTES
-- ==========================================

CREATE TABLE Universidad (
    id_universidad INT AUTO_INCREMENT PRIMARY KEY,
    id_pais INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    protocolo_auth ENUM('LDAP','SAML','OAuth2') NOT NULL,
    formato_datos ENUM('JSON','XML','CSV') NOT NULL,
    endpoint_api VARCHAR(255) NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_universidad_pais
        FOREIGN KEY (id_pais)
        REFERENCES Pais(id_pais)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS MetricaAgregada (
    id_metrica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_competencia INT DEFAULT NULL,
    id_pais INT DEFAULT NULL,
    id_carrera INT DEFAULT NULL,
    id_periodo INT DEFAULT NULL,
    carrera_segmento VARCHAR(120) NOT NULL,
    genero_segmento VARCHAR(20) NOT NULL,
    total_evaluaciones INT NOT NULL,
    total_aprobados INT NOT NULL,
    tasa_aprobacion DECIMAL(5,2) NOT NULL,
    anonimizada TINYINT(1) NOT NULL DEFAULT 1,
    fecha_calculo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

CREATE TABLE EvidenciaAntifraude (
    id_evidencia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion BIGINT UNSIGNED NOT NULL,
    tipo_evidencia ENUM('captura','log_tecleo','video') NOT NULL,
    uri_almacenamiento VARCHAR(255) NOT NULL,
    hash_sha256 CHAR(64) DEFAULT NULL,
    algoritmo_cifrado VARCHAR(30) DEFAULT NULL,
    timestamp_captura DATETIME NOT NULL,
    fecha_retencion_hasta DATE DEFAULT NULL,
    inmutable TINYINT(1) NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_evidencia_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DeteccionFraude (
    id_deteccion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion BIGINT UNSIGNED NOT NULL,
    id_evidencia BIGINT UNSIGNED NOT NULL,
    tipo_indicio VARCHAR(60) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    severidad VARCHAR(20) NOT NULL,
    estado_revision VARCHAR(20) NOT NULL,
    fecha_deteccion DATETIME NOT NULL DEFAULT NOW(),

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
) ENGINE=InnoDB;

-- ==========================================
-- DATOS BASE
-- ==========================================

INSERT INTO Pais (nombre, codigo_iso) VALUES
('Guatemala', 'GT'),
('Costa Rica', 'CR'),
('El Salvador', 'SV');

INSERT INTO Competencia (nombre) VALUES
('Programación en SQL'),
('Comprensión Lectora'),
('Programación'),
('Bases de Datos'),
('Redes'),
('Ciberseguridad'),
('Desarrollo Web'),
('Inteligencia Artificial'),
('Análisis de Datos'),
('Cloud Computing'),
('DevOps'),
('Gestión de Proyectos');

INSERT INTO PeriodoCertificacion (nombre) VALUES
('Primer Semestre 2026'),
('Segundo Semestre 2026'),
('Enero 2026'),
('Febrero 2026'),
('Marzo 2026'),
('Abril 2026'),
('Mayo 2026'),
('Junio 2026'),
('Julio 2026'),
('Agosto 2026'),
('Septiembre 2026'),
('Octubre 2026');

INSERT INTO Evaluacion (detalle) VALUES
('Evaluación diagnóstica de programación'),
('Evaluación intermedia de bases de datos'),
('Examen final de redes'),
('Prueba práctica de ciberseguridad'),
('Evaluación de desarrollo web frontend'),
('Evaluación de desarrollo web backend'),
('Prueba técnica de inteligencia artificial'),
('Examen de análisis de datos'),
('Evaluación de arquitectura cloud'),
('Certificación de DevOps');

-- ==========================================
-- UNIVERSIDADES
-- ==========================================

INSERT INTO Universidad (
    id_pais,
    nombre,
    protocolo_auth,
    formato_datos,
    endpoint_api,
    estado
) VALUES
(
    (SELECT id_pais FROM Pais WHERE codigo_iso='GT'),
    'USAC',
    'OAuth2',
    'JSON',
    'https://api.usac.edu.gt/v1',
    'activo'
),
(
    (SELECT id_pais FROM Pais WHERE codigo_iso='SV'),
    'UES',
    'LDAP',
    'XML',
    'https://api.ues.edu.sv/v1',
    'activo'
),
(
    (SELECT id_pais FROM Pais WHERE codigo_iso='CR'),
    'UCR',
    'SAML',
    'JSON',
    'https://api.ucr.ac.cr/v1',
    'activo'
);

-- ==========================================
-- CARRERAS
-- ==========================================

INSERT INTO Carrera (id_universidad, nombre) VALUES
(
    (SELECT id_universidad FROM Universidad WHERE nombre='USAC'),
    'Ingeniería en Ciencias y Sistemas'
),
(
    (SELECT id_universidad FROM Universidad WHERE nombre='USAC'),
    'Licenciatura en Ciencias Jurídicas'
),
(
    (SELECT id_universidad FROM Universidad WHERE nombre='UES'),
    'Ingeniería de Sistemas Informáticos'
),
(
    (SELECT id_universidad FROM Universidad WHERE nombre='UCR'),
    'Bachillerato en Computación e Informática'
);

-- ==========================================
-- METRICAS
-- ==========================================

INSERT INTO MetricaAgregada (
    id_competencia,
    id_pais,
    id_carrera,
    id_periodo,
    carrera_segmento,
    genero_segmento,
    total_evaluaciones,
    total_aprobados,
    tasa_aprobacion,
    anonimizada
)
VALUES
(
    1,
    (SELECT id_pais FROM Pais WHERE codigo_iso='GT'),
    (SELECT id_carrera FROM Carrera WHERE nombre='Ingeniería en Ciencias y Sistemas' LIMIT 1),
    1,
    'Tecnología',
    'Masculino',
    150,
    120,
    80.00,
    1
),
(
    1,
    (SELECT id_pais FROM Pais WHERE codigo_iso='GT'),
    (SELECT id_carrera FROM Carrera WHERE nombre='Ingeniería en Ciencias y Sistemas' LIMIT 1),
    1,
    'Tecnología',
    'Femenino',
    100,
    85,
    85.00,
    1
),
(
    2,
    (SELECT id_pais FROM Pais WHERE codigo_iso='CR'),
    (SELECT id_carrera FROM Carrera WHERE nombre='Bachillerato en Computación e Informática' LIMIT 1),
    1,
    'Tecnología',
    'Todos',
    200,
    170,
    85.00,
    1
),
(
    1,
    (SELECT id_pais FROM Pais WHERE codigo_iso='SV'),
    (SELECT id_carrera FROM Carrera WHERE nombre='Ingeniería de Sistemas Informáticos' LIMIT 1),
    2,
    'Tecnología',
    'Todos',
    90,
    63,
    70.00,
    1
);