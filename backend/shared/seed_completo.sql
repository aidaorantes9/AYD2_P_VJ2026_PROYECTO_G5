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

USE prccd;

-- Limpiar datos previos en orden correcto
DELETE FROM RespuestaEvaluacion;
DELETE FROM Evaluacion;
DELETE FROM InscripcionPeriodo;
DELETE FROM OpcionRespuesta;
DELETE FROM Pregunta;
DELETE FROM Competencia;
DELETE FROM PeriodoCertificacion;

-- Reiniciar autoincrementos
ALTER TABLE RespuestaEvaluacion AUTO_INCREMENT = 1;
ALTER TABLE Evaluacion AUTO_INCREMENT = 1;
ALTER TABLE InscripcionPeriodo AUTO_INCREMENT = 1;
ALTER TABLE OpcionRespuesta AUTO_INCREMENT = 1;
ALTER TABLE Pregunta AUTO_INCREMENT = 1;
ALTER TABLE Competencia AUTO_INCREMENT = 1;
ALTER TABLE PeriodoCertificacion AUTO_INCREMENT = 1;

-- 1. Periodo de certificacion
INSERT INTO PeriodoCertificacion (
  id_periodo,
  nombre,
  fecha_inicio,
  fecha_fin,
  activo
)
VALUES (
  1,
  'Junio 2026',
  '2026-06-01',
  '2026-06-30',
  TRUE
);

-- 2. Competencia
INSERT INTO Competencia (
  id_competencia,
  nombre,
  descripcion
)
VALUES (
  1,
  'Fundamentos de Programacion',
  'Evaluacion de conocimientos basicos de programacion'
);

-- 3. Preguntas
INSERT INTO Pregunta (
  id_pregunta,
  id_competencia,
  enunciado,
  nivel_dificultad,
  activa
)
VALUES
(1, 1, 'Que es una variable?', 'Basico', TRUE),
(2, 1, 'Que es un bucle for?', 'Basico', TRUE),
(3, 1, 'Que es una funcion?', 'Basico', TRUE),
(4, 1, 'Que es herencia en POO?', 'Intermedio', TRUE),
(5, 1, 'Que es una interfaz?', 'Intermedio', TRUE),
(6, 1, 'Cual es la diferencia entre stack y queue?', 'Intermedio', TRUE),
(7, 1, 'Que es un arbol binario?', 'Avanzado', TRUE),
(8, 1, 'Que es complejidad algoritmica O(n)?', 'Avanzado', TRUE),
(9, 1, 'Que es programacion funcional?', 'Avanzado', TRUE),
(10, 1, 'Que es un patron de diseno?', 'Avanzado', TRUE);

-- 4. Opciones de respuesta
INSERT INTO OpcionRespuesta (
  id_opcion,
  id_pregunta,
  texto_opcion,
  es_correcta
)
VALUES
-- Pregunta 1
(1, 1, 'Un espacio en memoria que guarda un valor', TRUE),
(2, 1, 'Un tipo de funcion', FALSE),
(3, 1, 'Un operador matematico', FALSE),
(4, 1, 'Un archivo del sistema', FALSE),

-- Pregunta 2
(5, 2, 'Una variable que guarda texto', FALSE),
(6, 2, 'Un tipo de base de datos', FALSE),
(7, 2, 'Una estructura que repite un bloque de codigo un numero determinado de veces', TRUE),
(8, 2, 'Un metodo para borrar archivos', FALSE),

-- Pregunta 3
(9, 3, 'Un tipo de variable', FALSE),
(10, 3, 'Un archivo de configuracion', FALSE),
(11, 3, 'Una base de datos', FALSE),
(12, 3, 'Un bloque de codigo reutilizable que realiza una tarea especifica', TRUE),

-- Pregunta 4
(13, 4, 'Un tipo de bucle', FALSE),
(14, 4, 'Mecanismo donde una clase hija adquiere propiedades y metodos de una clase padre', TRUE),
(15, 4, 'Una forma de borrar variables', FALSE),
(16, 4, 'Un protocolo de red', FALSE),

-- Pregunta 5
(17, 5, 'Un contrato que define metodos que una clase debe implementar', TRUE),
(18, 5, 'Una variable global', FALSE),
(19, 5, 'Un tipo de base de datos', FALSE),
(20, 5, 'Un archivo de imagen', FALSE),

-- Pregunta 6
(21, 6, 'No hay ninguna diferencia', FALSE),
(22, 6, 'Stack es mas rapido que queue siempre', FALSE),
(23, 6, 'Stack es LIFO y queue es FIFO', TRUE),
(24, 6, 'Que solo funciona con numeros', FALSE),

-- Pregunta 7
(25, 7, 'Un tipo de archivo de imagen', FALSE),
(26, 7, 'Una funcion matematica', FALSE),
(27, 7, 'Un protocolo de comunicacion', FALSE),
(28, 7, 'Una estructura de datos donde cada nodo tiene como maximo dos hijos', TRUE),

-- Pregunta 8
(29, 8, 'El algoritmo siempre tarda lo mismo sin importar la entrada', FALSE),
(30, 8, 'El tiempo de ejecucion crece de forma lineal con el tamano de la entrada', TRUE),
(31, 8, 'El algoritmo es imposible de ejecutar', FALSE),
(32, 8, 'Es un tipo de variable', FALSE),

-- Pregunta 9
(33, 9, 'Paradigma que trata la computacion como evaluacion de funciones matematicas', TRUE),
(34, 9, 'Un lenguaje de programacion especifico', FALSE),
(35, 9, 'Una forma de disenar bases de datos', FALSE),
(36, 9, 'Un tipo de bucle infinito', FALSE),

-- Pregunta 10
(37, 10, 'Un tipo de base de datos', FALSE),
(38, 10, 'Un lenguaje de programacion', FALSE),
(39, 10, 'Una solucion reutilizable a un problema comun en el diseno de software', TRUE),
(40, 10, 'Un protocolo de red', FALSE);

-- 5. Inscripcion del candidato al periodo
INSERT INTO InscripcionPeriodo (
  id_inscripcion,
  id_candidato,
  id_periodo
)
VALUES (
  1,
  1,
  1
);

-- 6. Evaluacion base que usa el backend
INSERT INTO Evaluacion (
  id_evaluacion,
  id_candidato,
  id_competencia,
  id_periodo,
  calificacion,
  estado,
  aprobada
)
VALUES (
  1,
  1,
  1,
  1,
  0.00,
  'en_progreso',
  FALSE
);

UPDATE Evaluacion
SET
  calificacion = 80.00,
  estado = 'finalizada',
  aprobada = TRUE
WHERE id_evaluacion = 1
  AND id_candidato = 1;

USE prccd;

INSERT INTO CandidatoSeguridad (id, nombre_cifrado, email_cifrado, estado_gdpr) VALUES
  (1, UNHEX('7727c36a13e42d8680743d4c6ed084e0'), UNHEX('7ad7bf97e9ab8dd187d790ecd101cf4f62e87f9b4c967845009c716b2e11d219'), 'activo'),
  (2, UNHEX('793acb153d36dd0944a1a92b7f492261'), UNHEX('dd79c4f856a9a06013fb78c448b57e66ea4f79760c4f49b0c70de904f424b47e'), 'activo'),
  (3, UNHEX('0233e2cc670d1be90c5dafc3cf6a6045'), UNHEX('b6d1aa732d9d0a24ebbd376d98a33b62835a2ea5c1d43e839cb5ae029a9dff7b'), 'activo'),
  (4, UNHEX('893fd5cc701eea36783ac6eac7e3cee3'), UNHEX('a7562f4e95c88824119c338b16f8e4efb422ca88e77e062d4654723ea0530d8a'), 'activo');

ALTER TABLE CandidatoSeguridad AUTO_INCREMENT = 5;

