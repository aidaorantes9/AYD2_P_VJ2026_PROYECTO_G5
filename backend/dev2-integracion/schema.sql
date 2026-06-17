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