CREATE DATABASE IF NOT EXISTS prccd;
USE prccd;

CREATE TABLE IF NOT EXISTS CandidatoSeguridad (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado  VARBINARY(255) NOT NULL,
    estado_gdpr    ENUM('activo', 'anonimizado', 'olvidado') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id)
);

