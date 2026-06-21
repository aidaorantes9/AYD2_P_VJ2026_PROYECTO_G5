const express = require('express');
const mysql = require('mysql2/promise');

const {
  TOTAL_PREGUNTAS,
  NOTA_APROBACION,
} = require('../config');

const router = express.Router();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'prccd',
});

function variantesNivel(nivel) {
  if (nivel === 'Básico' || nivel === 'Basico') {
    return ['Básico', 'Basico'];
  }

  return [nivel, nivel];
}

async function obtenerPreguntaDisponible(
  conexion,
  idEvaluacion,
  nivel
) {
  const [nivelUno, nivelDos] = variantesNivel(nivel);

  let [preguntas] = await conexion.query(
    `
    SELECT
      p.id_pregunta,
      p.enunciado,
      p.nivel_dificultad
    FROM Pregunta p
    WHERE p.activa = TRUE
      AND p.nivel_dificultad IN (?, ?)
      AND NOT EXISTS (
        SELECT 1
        FROM RespuestaEvaluacion r
        WHERE r.id_evaluacion = ?
          AND r.id_pregunta = p.id_pregunta
      )
    ORDER BY RAND()
    LIMIT 1
    `,
    [nivelUno, nivelDos, idEvaluacion]
  );

  // Si no quedan preguntas del nivel requerido, usa cualquier nivel disponible.
  if (preguntas.length === 0) {
    [preguntas] = await conexion.query(
      `
      SELECT
        p.id_pregunta,
        p.enunciado,
        p.nivel_dificultad
      FROM Pregunta p
      WHERE p.activa = TRUE
        AND NOT EXISTS (
          SELECT 1
          FROM RespuestaEvaluacion r
          WHERE r.id_evaluacion = ?
            AND r.id_pregunta = p.id_pregunta
        )
      ORDER BY RAND()
      LIMIT 1
      `,
      [idEvaluacion]
    );
  }

  if (preguntas.length === 0) {
    return null;
  }

  const pregunta = preguntas[0];

  const [opciones] = await conexion.query(
    `
    SELECT id_opcion, texto_opcion
    FROM OpcionRespuesta
    WHERE id_pregunta = ?
    ORDER BY id_opcion
    `,
    [pregunta.id_pregunta]
  );

  return {
    ...pregunta,
    opciones,
  };
}

// GET /api/evaluacion/:id_candidato/resultado
router.get('/:id_candidato/resultado', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id_evaluacion,
        id_candidato,
        calificacion,
        estado,
        aprobada
      FROM Evaluacion
      WHERE id_candidato = ?
      ORDER BY id_evaluacion DESC
      LIMIT 1
      `,
      [req.params.id_candidato]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No se encontró evaluación para este candidato',
      });
    }

    const evaluacion = rows[0];

    return res.json({
      id_evaluacion: evaluacion.id_evaluacion,
      id_candidato: Number(evaluacion.id_candidato),
      calificacion: Number(evaluacion.calificacion || 0),
      estado: evaluacion.estado,
      aprobada:
        evaluacion.aprobada === 1 ||
        evaluacion.aprobada === true,
    });
  } catch (error) {
    console.error('Error consultando resultado:', error);

    return res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
});

// POST /api/evaluacion/:id_candidato/iniciar
router.post('/:id_candidato/iniciar', async (req, res) => {
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const idCandidato = Number(req.params.id_candidato);

    const [candidatos] = await conexion.query(
      'SELECT id_candidato FROM Candidato WHERE id_candidato = ?',
      [idCandidato]
    );

    if (candidatos.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        error: 'Candidato no encontrado',
      });
    }

    // Reutiliza una evaluación en progreso para evitar duplicados al recargar.
    const [evaluaciones] = await conexion.query(
      `
      SELECT id_evaluacion
      FROM Evaluacion
      WHERE id_candidato = ?
        AND estado = 'en_progreso'
      ORDER BY id_evaluacion DESC
      LIMIT 1
      `,
      [idCandidato]
    );

    let idEvaluacion;

    if (evaluaciones.length > 0) {
      idEvaluacion = evaluaciones[0].id_evaluacion;
    } else {
      const [competencias] = await conexion.query(
        `
        SELECT id_competencia
        FROM Competencia
        ORDER BY id_competencia
        LIMIT 1
        `
      );

      const [periodos] = await conexion.query(
        `
        SELECT id_periodo
        FROM PeriodoCertificacion
        WHERE activo = TRUE
        ORDER BY id_periodo DESC
        LIMIT 1
        `
      );

      if (competencias.length === 0 || periodos.length === 0) {
        await conexion.rollback();

        return res.status(409).json({
          error: 'No existe competencia o período activo',
        });
      }

      const [resultado] = await conexion.query(
        `
        INSERT INTO Evaluacion (
          id_candidato,
          id_competencia,
          id_periodo,
          calificacion,
          estado,
          aprobada,
          fecha_inicio
        )
        VALUES (?, ?, ?, 0, 'en_progreso', FALSE, NOW())
        `,
        [
          idCandidato,
          competencias[0].id_competencia,
          periodos[0].id_periodo,
        ]
      );

      idEvaluacion = resultado.insertId;
    }

    const [respuestas] = await conexion.query(
      `
      SELECT es_correcta
      FROM RespuestaEvaluacion
      WHERE id_evaluacion = ?
      ORDER BY orden_secuencia DESC
      LIMIT 1
      `,
      [idEvaluacion]
    );

    const nivelSiguiente =
      respuestas.length === 0
        ? 'Intermedio'
        : respuestas[0].es_correcta
          ? 'Avanzado'
          : 'Básico';

    const pregunta = await obtenerPreguntaDisponible(
      conexion,
      idEvaluacion,
      nivelSiguiente
    );

    if (!pregunta) {
      await conexion.rollback();

      return res.status(409).json({
        error: 'No hay preguntas disponibles',
      });
    }

    const [conteo] = await conexion.query(
      `
      SELECT COUNT(*) AS respondidas
      FROM RespuestaEvaluacion
      WHERE id_evaluacion = ?
      `,
      [idEvaluacion]
    );

    await conexion.commit();

    return res.status(200).json({
      id_evaluacion: idEvaluacion,
      total_preguntas: TOTAL_PREGUNTAS,
      numero_pregunta: Number(conteo[0].respondidas) + 1,
      pregunta,
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error iniciando evaluación:', error);

    return res.status(500).json({
      error: 'No fue posible iniciar la evaluación',
    });
  } finally {
    conexion.release();
  }
});

// POST /api/evaluacion/respuesta
router.post('/respuesta', async (req, res) => {
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const {
      id_candidato,
      id_evaluacion,
      id_pregunta,
      id_opcion_seleccionada,
      tiempo_respuesta_ms = null,
    } = req.body;

    if (
      !id_candidato ||
      !id_evaluacion ||
      !id_pregunta ||
      !id_opcion_seleccionada
    ) {
      await conexion.rollback();

      return res.status(400).json({
        error: 'Faltan datos obligatorios de la respuesta',
      });
    }

    const [evaluaciones] = await conexion.query(
      `
      SELECT estado
      FROM Evaluacion
      WHERE id_evaluacion = ?
        AND id_candidato = ?
      FOR UPDATE
      `,
      [id_evaluacion, id_candidato]
    );

    if (evaluaciones.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        error: 'Evaluación no encontrada',
      });
    }

    if (evaluaciones[0].estado !== 'en_progreso') {
      await conexion.rollback();

      return res.status(409).json({
        error: 'La evaluación ya fue finalizada',
      });
    }

    const [respuestaExistente] = await conexion.query(
      `
      SELECT id_respuesta
      FROM RespuestaEvaluacion
      WHERE id_evaluacion = ?
        AND id_pregunta = ?
      `,
      [id_evaluacion, id_pregunta]
    );

    if (respuestaExistente.length > 0) {
      await conexion.rollback();

      return res.status(409).json({
        error: 'La pregunta ya fue respondida',
      });
    }

    const [opciones] = await conexion.query(
      `
      SELECT
        o.es_correcta,
        p.nivel_dificultad
      FROM OpcionRespuesta o
      INNER JOIN Pregunta p
        ON p.id_pregunta = o.id_pregunta
      WHERE o.id_opcion = ?
        AND o.id_pregunta = ?
      `,
      [id_opcion_seleccionada, id_pregunta]
    );

    if (opciones.length === 0) {
      await conexion.rollback();

      return res.status(400).json({
        error: 'La opción no pertenece a la pregunta',
      });
    }

    const esCorrecta =
      opciones[0].es_correcta === 1 ||
      opciones[0].es_correcta === true;

    const [conteoPrevio] = await conexion.query(
      `
      SELECT COUNT(*) AS total
      FROM RespuestaEvaluacion
      WHERE id_evaluacion = ?
      `,
      [id_evaluacion]
    );

    const ordenSecuencia =
      Number(conteoPrevio[0].total) + 1;

    await conexion.query(
      `
      INSERT INTO RespuestaEvaluacion (
        id_evaluacion,
        id_pregunta,
        id_opcion_seleccionada,
        dificultad_presentada,
        es_correcta,
        tiempo_respuesta_ms,
        orden_secuencia
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_evaluacion,
        id_pregunta,
        id_opcion_seleccionada,
        opciones[0].nivel_dificultad,
        esCorrecta,
        tiempo_respuesta_ms,
        ordenSecuencia,
      ]
    );

    if (ordenSecuencia >= TOTAL_PREGUNTAS) {
      const [totales] = await conexion.query(
        `
        SELECT SUM(es_correcta) AS correctas
        FROM RespuestaEvaluacion
        WHERE id_evaluacion = ?
        `,
        [id_evaluacion]
      );

      const correctas = Number(totales[0].correctas || 0);
      const calificacion =
        (correctas / TOTAL_PREGUNTAS) * 100;
      const aprobada =
        calificacion >= NOTA_APROBACION;

      await conexion.query(
        `
        UPDATE Evaluacion
        SET
          calificacion = ?,
          estado = 'finalizada',
          aprobada = ?,
          fecha_fin = NOW()
        WHERE id_evaluacion = ?
        `,
        [calificacion, aprobada, id_evaluacion]
      );

      await conexion.commit();

      return res.json({
        terminado: true,
        resultado: {
          id_evaluacion,
          calificacion,
          aprobada,
          correctas,
          total: TOTAL_PREGUNTAS,
        },
      });
    }

    const nivelSiguiente = esCorrecta
      ? 'Avanzado'
      : 'Básico';

    const siguientePregunta =
      await obtenerPreguntaDisponible(
        conexion,
        id_evaluacion,
        nivelSiguiente
      );

    if (!siguientePregunta) {
      await conexion.rollback();

      return res.status(409).json({
        error: 'El banco no contiene suficientes preguntas',
      });
    }

    await conexion.commit();

    return res.json({
      terminado: false,
      es_correcta: esCorrecta,
      numero_pregunta: ordenSecuencia + 1,
      siguiente_pregunta: siguientePregunta,
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error registrando respuesta:', error);

    return res.status(500).json({
      error: 'No fue posible registrar la respuesta',
    });
  } finally {
    conexion.release();
  }
});

// POST /api/evaluacion/:id_candidato/finalizar
router.post('/:id_candidato/finalizar', async (req, res) => {
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const idCandidato = Number(req.params.id_candidato);
    const idEvaluacion = Number(req.body.id_evaluacion);

    if (!idCandidato || !idEvaluacion) {
      await conexion.rollback();

      return res.status(400).json({
        error: 'El candidato y la evaluación son obligatorios',
      });
    }

    const [evaluaciones] = await conexion.query(
      `
      SELECT estado
      FROM Evaluacion
      WHERE id_evaluacion = ?
        AND id_candidato = ?
      FOR UPDATE
      `,
      [idEvaluacion, idCandidato]
    );

    if (evaluaciones.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        error: 'Evaluación no encontrada',
      });
    }

    const [totales] = await conexion.query(
      `
      SELECT
        COUNT(*) AS respondidas,
        COALESCE(SUM(es_correcta), 0) AS correctas
      FROM RespuestaEvaluacion
      WHERE id_evaluacion = ?
      `,
      [idEvaluacion]
    );

    const respondidas = Number(totales[0].respondidas);
    const correctas = Number(totales[0].correctas);

    // Las preguntas no respondidas se consideran incorrectas.
    const calificacion =
      (correctas / TOTAL_PREGUNTAS) * 100;

    const aprobada =
      calificacion >= NOTA_APROBACION;

    await conexion.query(
      `
      UPDATE Evaluacion
      SET
        calificacion = ?,
        estado = 'finalizada',
        aprobada = ?,
        fecha_fin = NOW()
      WHERE id_evaluacion = ?
      `,
      [calificacion, aprobada, idEvaluacion]
    );

    await conexion.commit();

    return res.json({
      id_evaluacion: idEvaluacion,
      calificacion,
      aprobada,
      correctas,
      respondidas,
      total: TOTAL_PREGUNTAS,
    });
  } catch (error) {
    await conexion.rollback();

    console.error('Error finalizando evaluación:', error);

    return res.status(500).json({
      error: 'No fue posible finalizar la evaluación',
    });
  } finally {
    conexion.release();
  }
});

module.exports = router;
