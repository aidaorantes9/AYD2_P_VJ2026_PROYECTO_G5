-- Selecciona la base de datos del proyecto
USE prccd;

-- Limpia datos previos respetando dependencias entre tablas
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE HistorialAcademico;
TRUNCATE TABLE Candidato;
TRUNCATE TABLE IngestaDatosAcademicos;
TRUNCATE TABLE Carrera;
TRUNCATE TABLE Universidad;
TRUNCATE TABLE Pais;

SET FOREIGN_KEY_CHECKS = 1;

-- Inserta países base para las universidades integradas
INSERT INTO Pais (id_pais, nombre, codigo_iso)
VALUES
    (1, 'Guatemala', 'GT'),
    (2, 'Costa Rica', 'CR'),
    (3, 'El Salvador', 'SV');

-- Inserta universidades con sus protocolos y formatos acordados
INSERT INTO Universidad (
    id_universidad,
    id_pais,
    nombre,
    protocolo_auth,
    formato_datos,
    endpoint_api,
    estado
)
VALUES
    (
        1,
        1,
        'Universidad de San Carlos de Guatemala',
        'LDAP',
        'JSON',
        'https://api.usac.edu.gt/academico',
        'activo'
    ),
    (
        2,
        2,
        'Universidad de Costa Rica',
        'SAML',
        'XML',
        'https://api.ucr.ac.cr/academico',
        'activo'
    ),
    (
        3,
        3,
        'Universidad de El Salvador',
        'OAuth2',
        'CSV',
        'https://api.ues.edu.sv/academico',
        'activo'
    );

-- Inserta carreras vinculadas a cada universidad
INSERT INTO Carrera (
    id_carrera,
    id_universidad,
    nombre
)
VALUES
    (1, 1, 'Ingenieria en Sistemas'),
    (2, 2, 'Ingenieria en Sistemas'),
    (3, 3, 'Ingenieria en Sistemas');

-- Registra procesos simulados de ingesta académica
INSERT INTO IngestaDatosAcademicos (
    id_ingesta,
    id_universidad,
    formato_datos,
    estado,
    registros_procesados,
    registros_rechazados,
    detalle_errores,
    fecha_ingesta
)
VALUES
    (
        1,
        1,
        'JSON',
        'procesada',
        2,
        0,
        NULL,
        '2026-06-16 09:00:00'
    ),
    (
        2,
        2,
        'XML',
        'procesada',
        2,
        0,
        NULL,
        '2026-06-16 09:15:00'
    ),
    (
        3,
        3,
        'CSV',
        'procesada',
        2,
        0,
        NULL,
        '2026-06-16 09:30:00'
    );

-- Inserta candidatos de prueba importados desde las universidades
-- Ana Lopez conserva id_candidato = 1 según el acuerdo del sprint
INSERT INTO Candidato (
    id_candidato,
    id_pais,
    id_carrera,
    id_universidad,
    id_ingesta,
    nombre_cifrado,
    email_cifrado,
    genero,
    id_externo_univ,
    fecha_registro,
    estado_gdpr
)
VALUES
    (
        1,
        1,
        1,
        1,
        1,
        'Ana Lopez',
        'ana.lopez@usac.edu.gt',
        'F',
        'USAC-2024-001',
        '2026-06-15 08:00:00',
        'activo'
    ),
    (
        2,
        1,
        1,
        1,
        1,
        'Luis Ramirez',
        'luis.ramirez@usac.edu.gt',
        'M',
        'USAC-2024-002',
        '2026-06-15 08:10:00',
        'activo'
    ),
    (
        3,
        2,
        2,
        2,
        2,
        'Carlos Mora',
        'carlos.mora@ucr.ac.cr',
        'M',
        'UCR-2024-001',
        '2026-06-15 08:20:00',
        'activo'
    ),
    (
        4,
        2,
        2,
        2,
        2,
        'Sofia Hernandez',
        'sofia.hernandez@ucr.ac.cr',
        'F',
        'UCR-2024-002',
        '2026-06-15 08:30:00',
        'activo'
    ),
    (
        5,
        3,
        3,
        3,
        3,
        'Maria Ramos',
        'maria.ramos@ues.edu.sv',
        'F',
        'UES-2024-001',
        '2026-06-15 08:40:00',
        'activo'
    ),
    (
        6,
        3,
        3,
        3,
        3,
        'Pedro Jimenez',
        'pedro.jimenez@ues.edu.sv',
        'M',
        'UES-2024-002',
        '2026-06-15 08:50:00',
        'activo'
    );

-- Inserta historial académico normalizado de cada candidato
INSERT INTO HistorialAcademico (
    id_historial,
    id_candidato,
    codigo_curso,
    nombre_curso,
    nota_final
)
VALUES
    (1, 1, 'SIS-101', 'Introduccion a la Programacion', 85.00),
    (2, 1, 'SIS-202', 'Estructuras de Datos', 90.00),
    (3, 1, 'SIS-301', 'Bases de Datos 1', 88.00),

    (4, 2, 'SIS-101', 'Introduccion a la Programacion', 79.00),
    (5, 2, 'SIS-205', 'Arquitectura de Computadores', 82.00),

    (6, 3, 'INF-100', 'Fundamentos de Informatica', 82.00),
    (7, 3, 'INF-210', 'Bases de Datos', 88.00),
    (8, 3, 'INF-320', 'Ingenieria de Software', 91.00),

    (9, 4, 'INF-100', 'Fundamentos de Informatica', 87.00),
    (10, 4, 'INF-250', 'Redes de Computadoras', 84.00),

    (11, 5, 'PRG-101', 'Programacion I', 86.00),
    (12, 5, 'BD-201', 'Bases de Datos I', 91.00),
    (13, 5, 'SO-301', 'Sistemas Operativos', 89.00),

    (14, 6, 'PRG-101', 'Programacion I', 80.00),
    (15, 6, 'RED-301', 'Redes de Computadoras', 84.00);