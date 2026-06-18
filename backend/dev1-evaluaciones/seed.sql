--datos prueba


-- Candidato de prueba (Acuerdo 1 — todos usan el mismo)
INSERT INTO Candidato (id_candidato, nombre_cifrado, email_cifrado, genero, id_externo_univ, fecha_registro, estado_gdpr)
VALUES (1, 'Ana Lopez', 'ana.lopez@usac.edu.gt', 'F', 'USAC-2024-001', '2026-06-15', 'activo')
ON DUPLICATE KEY UPDATE id_candidato = id_candidato;

-- Período de certificación
INSERT INTO PeriodoCertificacion (id_periodo, nombre, fecha_inicio, fecha_fin, activo)
VALUES (1, 'Junio 2026', '2026-06-01', '2026-06-30', TRUE);

-- Competencia de prueba
INSERT INTO Competencia (id_competencia, nombre, descripcion)
VALUES (1, 'Fundamentos de Programación', 'Evaluación de conocimientos básicos de programación');

-- Inscripción de Ana al período
INSERT INTO InscripcionPeriodo (id_candidato, id_periodo)
VALUES (1, 1);

-- Preguntas de prueba (10 preguntas según Acuerdo 6)
INSERT INTO Pregunta (id_pregunta, id_competencia, enunciado, nivel_dificultad) VALUES
(1,  1, '¿Qué es una variable?',                       'Básico'),
(2,  1, '¿Qué es un bucle for?',                       'Básico'),
(3,  1, '¿Qué es una función?',                        'Básico'),
(4,  1, '¿Qué es herencia en POO?',                    'Intermedio'),
(5,  1, '¿Qué es una interfaz?',                       'Intermedio'),
(6,  1, '¿Cuál es la diferencia entre stack y queue?', 'Intermedio'),
(7,  1, '¿Qué es un árbol binario?',                   'Avanzado'),
(8,  1, '¿Qué es complejidad algorítmica O(n)?',       'Avanzado'),
(9,  1, '¿Qué es programación funcional?',             'Avanzado'),
(10, 1, '¿Qué es un patrón de diseño?',                'Avanzado');

-- Opciones para pregunta 1 (las demás las agregas igual)
INSERT INTO OpcionRespuesta (id_pregunta, texto_opcion, es_correcta) VALUES
(1, 'Un espacio en memoria que guarda un valor',      TRUE),
(1, 'Un tipo de función',                             FALSE),
(1, 'Un operador matemático',                         FALSE),
(1, 'Un archivo del sistema',                         FALSE);

-- Evaluación aprobada (Acuerdo 2 — obligatorio)
INSERT INTO Evaluacion (id_evaluacion, id_candidato, id_competencia, id_periodo, calificacion, estado, aprobada)
VALUES (1, 1, 1, 1, 80.00, 'finalizada', TRUE)
ON DUPLICATE KEY UPDATE id_evaluacion = id_evaluacion;