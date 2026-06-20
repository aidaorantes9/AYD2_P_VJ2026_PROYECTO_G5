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