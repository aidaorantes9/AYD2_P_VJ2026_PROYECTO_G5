// evaluacion.js — rutas del Motor de Evaluaciones
const express = require('express');
const router  = express.Router();
const mysql   = require('mysql2/promise');

// Conexión a la base de datos
const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME     || 'prccd',
});


// GET /api/evaluacion/:id_candidato/resultado
router.get('/:id_candidato/resultado', async (req, res) => {
  const { id_candidato } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id_evaluacion, id_candidato, calificacion, estado, aprobada
       FROM Evaluacion
       WHERE id_candidato = ?
       ORDER BY id_evaluacion DESC
       LIMIT 1`,
      [id_candidato]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró evaluación para este candidato' });
    }

    // Formato exacto acordado en el documento (Acuerdo 3)
    const evaluacion = rows[0];
    res.json({
      id_evaluacion: evaluacion.id_evaluacion,
      id_candidato:  Number(id_candidato),
      calificacion:  parseFloat(evaluacion.calificacion),
      estado:        evaluacion.estado,
      aprobada:      evaluacion.aprobada === 1 || evaluacion.aprobada === true,
    });

  } catch (error) {
    console.error('Error en /resultado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── OTROS ENDPOINTS útiles para tu pantalla ──────────────────────────────

// GET /api/evaluacion/:id_candidato/preguntas — trae las 10 preguntas del examen
router.get('/:id_candidato/preguntas', async (req, res) => {
  try {
    const [preguntas] = await db.query(
      `SELECT p.id_pregunta, p.enunciado, p.nivel_dificultad,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id_opcion', o.id_opcion,
                  'texto_opcion', o.texto_opcion
                )
              ) AS opciones
       FROM Pregunta p
       JOIN OpcionRespuesta o ON o.id_pregunta = p.id_pregunta
       WHERE p.activa = TRUE
       GROUP BY p.id_pregunta
       LIMIT 10`
    );
    res.json({ preguntas });
  } catch (error) {
    console.error('Error al traer preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/evaluacion/:id_candidato/responder — guarda las respuestas y califica
router.post('/:id_candidato/responder', async (req, res) => {
  const { id_candidato } = req.params;
  const { id_evaluacion, respuestas } = req.body;
  // respuestas = [{ id_pregunta, id_opcion_seleccionada, tiempo_respuesta_ms, orden_secuencia }]

  try {
    let correctas = 0;

    for (let i = 0; i < respuestas.length; i++) {
      const r = respuestas[i];

      // Verifica si la opción es correcta
      const [opcion] = await db.query(
        'SELECT es_correcta FROM OpcionRespuesta WHERE id_opcion = ?',
        [r.id_opcion_seleccionada]
      );
      const [pregunta] = await db.query(
        'SELECT nivel_dificultad FROM Pregunta WHERE id_pregunta = ?',
        [r.id_pregunta]
      );

      const es_correcta = opcion[0]?.es_correcta || false;
      if (es_correcta) correctas++;

      await db.query(
        `INSERT INTO RespuestaEvaluacion
         (id_evaluacion, id_pregunta, id_opcion_seleccionada, dificultad_presentada, es_correcta, tiempo_respuesta_ms, orden_secuencia)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id_evaluacion,
          r.id_pregunta,
          r.id_opcion_seleccionada,
          pregunta[0]?.nivel_dificultad || 'Básico',
          es_correcta,
          r.tiempo_respuesta_ms || null,
          i + 1,
        ]
      );
    }

    // Calificación sobre 100
    const TOTAL_PREGUNTAS = 10;
    const calificacion    = (correctas / TOTAL_PREGUNTAS) * 100;
    const aprobada        = calificacion >= 70;

    await db.query(
      `UPDATE Evaluacion SET calificacion = ?, estado = 'finalizada', aprobada = ?, fecha_fin = NOW()
       WHERE id_evaluacion = ?`,
      [calificacion, aprobada, id_evaluacion]
    );

    res.json({ calificacion, aprobada, correctas, total: TOTAL_PREGUNTAS });

  } catch (error) {
    console.error('Error al guardar respuestas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;