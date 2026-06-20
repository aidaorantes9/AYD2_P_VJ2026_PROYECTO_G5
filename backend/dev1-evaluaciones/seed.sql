USE prccd;

DELETE FROM OpcionRespuesta;

-- Pregunta 1: correcta en posición 1
INSERT INTO OpcionRespuesta (id_pregunta, texto_opcion, es_correcta) VALUES
(1, 'Un espacio en memoria que guarda un valor', TRUE),
(1, 'Un tipo de función', FALSE),
(1, 'Un operador matemático', FALSE),
(1, 'Un archivo del sistema', FALSE),

-- Pregunta 2: correcta en posición 3
(2, 'Una variable que guarda texto', FALSE),
(2, 'Un tipo de base de datos', FALSE),
(2, 'Una estructura que repite un bloque de código un número determinado de veces', TRUE),
(2, 'Un método para borrar archivos', FALSE),

-- Pregunta 3: correcta en posición 4
(3, 'Un tipo de variable', FALSE),
(3, 'Un archivo de configuración', FALSE),
(3, 'Una base de datos', FALSE),
(3, 'Un bloque de código reutilizable que realiza una tarea específica', TRUE),

-- Pregunta 4: correcta en posición 2
(4, 'Un tipo de bucle', FALSE),
(4, 'Mecanismo donde una clase hija adquiere propiedades y métodos de una clase padre', TRUE),
(4, 'Una forma de borrar variables', FALSE),
(4, 'Un protocolo de red', FALSE),

-- Pregunta 5: correcta en posición 1
(5, 'Un contrato que define métodos que una clase debe implementar', TRUE),
(5, 'Una variable global', FALSE),
(5, 'Un tipo de base de datos', FALSE),
(5, 'Un archivo de imagen', FALSE),

-- Pregunta 6: correcta en posición 3
(6, 'No hay ninguna diferencia', FALSE),
(6, 'Stack es más rápido que queue siempre', FALSE),
(6, 'Stack es LIFO y queue es FIFO', TRUE),
(6, 'Que solo funciona con números', FALSE),

-- Pregunta 7: correcta en posición 4
(7, 'Un tipo de archivo de imagen', FALSE),
(7, 'Una función matemática', FALSE),
(7, 'Un protocolo de comunicación', FALSE),
(7, 'Una estructura de datos donde cada nodo tiene como máximo dos hijos', TRUE);

-- Pregunta 8: correcta en posición 2
(8, 'El algoritmo siempre tarda lo mismo sin importar la entrada', FALSE),
(8, 'El tiempo de ejecución crece de forma lineal con el tamaño de la entrada', TRUE),
(8, 'El algoritmo es imposible de ejecutar', FALSE),
(8, 'Es un tipo de variable', FALSE),

-- Pregunta 9: correcta en posición 1
(9, 'Paradigma que trata la computación como evaluación de funciones matemáticas', TRUE),
(9, 'Un lenguaje de programación específico', FALSE),
(9, 'Una forma de diseñar bases de datos', FALSE),
(9, 'Un tipo de bucle infinito', FALSE),

-- Pregunta 10: correcta en posición 3
(10, 'Un tipo de base de datos', FALSE),
(10, 'Un lenguaje de programación', FALSE),
(10, 'Una solución reutilizable a un problema común en el diseño de software', TRUE),
(10, 'Un protocolo de red', FALSE);