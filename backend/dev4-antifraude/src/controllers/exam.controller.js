const fs = require('fs-extra')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
const pool = require('../db')
const {
  notificarDeteccionFraude,
} = require('../services/notificacionFraudeService')

const UPLOADS = path.resolve(__dirname, '../uploads')

const SCREENSHOTS_DIR = path.join(
  UPLOADS,
  'screenshots'
)

const KEYSTROKES_DIR = path.join(
  UPLOADS,
  'keystrokes'
)

const VIDEOS_DIR = path.join(
  UPLOADS,
  'videos'
)

fs.ensureDirSync(SCREENSHOTS_DIR)
fs.ensureDirSync(KEYSTROKES_DIR)
fs.ensureDirSync(VIDEOS_DIR)

function sha256(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
}

function fechaRetencion() {
  const fecha = new Date()
  fecha.setFullYear(
    fecha.getFullYear() + 5
  )

  return fecha
    .toISOString()
    .split('T')[0]
}

function obtenerIdEvaluacion(valor) {
  const idEvaluacion = Number(valor)

  if (
    !Number.isInteger(idEvaluacion) ||
    idEvaluacion <= 0
  ) {
    return null
  }

  return idEvaluacion
}

async function validarEvaluacion(
  idEvaluacion
) {
  const [evaluaciones] =
    await pool.query(
      `
      SELECT id_evaluacion
      FROM Evaluacion
      WHERE id_evaluacion = ?
      `,
      [idEvaluacion]
    )

  return evaluaciones.length > 0
}

/*
 * POST /api/exam/screenshots
 */
async function saveScreenshot(req, res) {
  try {
    const {
      image,
      id_evaluacion,
    } = req.body

    const idEvaluacion =
      obtenerIdEvaluacion(
        id_evaluacion
      )

    if (!idEvaluacion) {
      return res.status(400).json({
        error:
          'id_evaluacion inválido',
      })
    }

    if (
      !(await validarEvaluacion(
        idEvaluacion
      ))
    ) {
      return res.status(404).json({
        error:
          'La evaluación no existe',
      })
    }

    if (!image) {
      return res.status(400).json({
        error: 'image vacío',
      })
    }

    const partes =
      String(image).split(',')

    const base64 =
      partes.length > 1
        ? partes[1]
        : partes[0]

    if (!base64) {
      return res.status(400).json({
        error: 'base64 inválido',
      })
    }

    const fileName =
      `shot-${idEvaluacion}-${Date.now()}.png`

    const filePath = path.join(
      SCREENSHOTS_DIR,
      fileName
    )

    await fs.writeFile(
      filePath,
      base64,
      'base64'
    )

    const fileBuffer =
      await fs.readFile(filePath)

    const hash =
      sha256(fileBuffer)

    const timestampCaptura =
      new Date()

    const [resultado] =
      await pool.query(
        `
        INSERT INTO EvidenciaAntifraude (
          id_evaluacion,
          tipo_evidencia,
          uri_almacenamiento,
          hash_sha256,
          algoritmo_cifrado,
          timestamp_captura,
          fecha_retencion_hasta,
          inmutable,
          creado_en
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idEvaluacion,
          'captura',
          filePath,
          hash,
          'HASH_SHA256',
          timestampCaptura,
          fechaRetencion(),
          1,
          new Date(),
        ]
      )

    return res.status(201).json({
      ok: true,
      id_evidencia:
        resultado.insertId,
      id_evaluacion:
        idEvaluacion,
      tipo_evidencia:
        'captura',
      file: fileName,
      hash_sha256: hash,
    })
  } catch (error) {
    console.error(
      'Screenshot error:',
      error
    )

    return res.status(500).json({
      error: error.message,
    })
  }
}

/*
 * POST /api/exam/keystrokes
 */
async function saveKeystrokes(
  req,
  res
) {
  try {
    const {
      logs,
      id_evaluacion,
    } = req.body

    const idEvaluacion =
      obtenerIdEvaluacion(
        id_evaluacion
      )

    if (!idEvaluacion) {
      return res.status(400).json({
        error:
          'id_evaluacion inválido',
      })
    }

    if (
      !(await validarEvaluacion(
        idEvaluacion
      ))
    ) {
      return res.status(404).json({
        error:
          'La evaluación no existe',
      })
    }

    if (
      !Array.isArray(logs)
    ) {
      return res.status(400).json({
        error: 'logs inválidos',
      })
    }

    const fileName =
      `keys-${idEvaluacion}-${Date.now()}.json`

    const filePath = path.join(
      KEYSTROKES_DIR,
      fileName
    )

    const content =
      JSON.stringify(
        logs,
        null,
        2
      )

    await fs.writeFile(
      filePath,
      content,
      'utf8'
    )

    const fileBuffer =
      await fs.readFile(filePath)

    const hash =
      sha256(fileBuffer)

    const [resultado] =
      await pool.query(
        `
        INSERT INTO EvidenciaAntifraude (
          id_evaluacion,
          tipo_evidencia,
          uri_almacenamiento,
          hash_sha256,
          algoritmo_cifrado,
          timestamp_captura,
          fecha_retencion_hasta,
          inmutable,
          creado_en
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idEvaluacion,
          'log_tecleo',
          filePath,
          hash,
          'HASH_SHA256',
          new Date(),
          fechaRetencion(),
          1,
          new Date(),
        ]
      )

    return res.status(201).json({
      ok: true,
      id_evidencia:
        resultado.insertId,
      id_evaluacion:
        idEvaluacion,
      tipo_evidencia:
        'log_tecleo',
      file: fileName,
      hash_sha256: hash,
    })
  } catch (error) {
    console.error(
      'Keystrokes error:',
      error
    )

    return res.status(500).json({
      error: error.message,
    })
  }
}

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      callback
    ) => {
      fs.ensureDirSync(
        VIDEOS_DIR
      )

      callback(
        null,
        VIDEOS_DIR
      )
    },

    filename: (
      req,
      file,
      callback
    ) => {
      callback(
        null,
        `video-${Date.now()}.webm`
      )
    },
  })

const upload =
  multer({
    storage,
  })

const uploadMiddleware =
  upload.single('video')

/*
 * POST /api/exam/video-inicial
 */
async function saveVideo(req, res) {
  try {
    const idEvaluacion =
      obtenerIdEvaluacion(
        req.body.id_evaluacion
      )

    if (!idEvaluacion) {
      if (req.file?.path) {
        await fs.remove(
          req.file.path
        )
      }

      return res.status(400).json({
        error:
          'id_evaluacion inválido',
      })
    }

    if (
      !(await validarEvaluacion(
        idEvaluacion
      ))
    ) {
      if (req.file?.path) {
        await fs.remove(
          req.file.path
        )
      }

      return res.status(404).json({
        error:
          'La evaluación no existe',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'video vacío',
      })
    }

    const filePath =
      req.file.path

    const fileBuffer =
      await fs.readFile(filePath)

    const hash =
      sha256(fileBuffer)

    const [resultado] =
      await pool.query(
        `
        INSERT INTO EvidenciaAntifraude (
          id_evaluacion,
          tipo_evidencia,
          uri_almacenamiento,
          hash_sha256,
          algoritmo_cifrado,
          timestamp_captura,
          fecha_retencion_hasta,
          inmutable,
          creado_en
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idEvaluacion,
          'video',
          filePath,
          hash,
          'HASH_SHA256',
          new Date(),
          fechaRetencion(),
          1,
          new Date(),
        ]
      )

    return res.status(201).json({
      ok: true,
      id_evidencia:
        resultado.insertId,
      id_evaluacion:
        idEvaluacion,
      tipo_evidencia:
        'video',
      file:
        req.file.filename,
      hash_sha256: hash,
    })
  } catch (error) {
    console.error(
      'Video error:',
      error
    )

    return res.status(500).json({
      error: error.message,
    })
  }
}

/*
 * GET /api/exam/evidencias/:id_evaluacion
 */
async function getEvidencias(
  req,
  res
) {
  try {
    const idEvaluacion =
      obtenerIdEvaluacion(
        req.params.id_evaluacion
      )

    if (!idEvaluacion) {
      return res.status(400).json({
        error:
          'id_evaluacion inválido',
      })
    }

    if (
      !(await validarEvaluacion(
        idEvaluacion
      ))
    ) {
      return res.status(404).json({
        error:
          'La evaluación no existe',
      })
    }

    const [evidencias] =
      await pool.query(
        `
        SELECT
          id_evidencia,
          id_evaluacion,
          tipo_evidencia,
          uri_almacenamiento,
          hash_sha256,
          algoritmo_cifrado,
          timestamp_captura,
          fecha_retencion_hasta,
          inmutable,
          creado_en
        FROM EvidenciaAntifraude
        WHERE id_evaluacion = ?
        ORDER BY
          timestamp_captura DESC,
          id_evidencia DESC
        `,
        [idEvaluacion]
      )

    const [detecciones] =
      await pool.query(
        `
        SELECT
          d.id_deteccion,
          d.id_evaluacion,
          d.id_evidencia,
          d.tipo_indicio,
          d.descripcion,
          d.severidad,
          d.estado_revision,
          d.fecha_deteccion
        FROM DeteccionFraude d
        WHERE d.id_evaluacion = ?
        ORDER BY
          d.fecha_deteccion DESC,
          d.id_deteccion DESC
        `,
        [idEvaluacion]
      )

    const evidenciasNormalizadas =
      evidencias.map(
        (evidencia) => {
          const rutaRelativa =
            path
              .relative(
                UPLOADS,
                evidencia
                  .uri_almacenamiento
              )
              .split(path.sep)
              .join('/')

          return {
            ...evidencia,

            inmutable:
              evidencia.inmutable ===
                1 ||
              evidencia.inmutable ===
                true,

            archivo_url:
              `/api/exam/archivos/${rutaRelativa}`,
          }
        }
      )

    const capturas =
      evidenciasNormalizadas.filter(
        (evidencia) =>
          evidencia.tipo_evidencia ===
          'captura'
      ).length

    const logsTecleo =
      evidenciasNormalizadas.filter(
        (evidencia) =>
          evidencia.tipo_evidencia ===
          'log_tecleo'
      ).length

    const videos =
      evidenciasNormalizadas.filter(
        (evidencia) =>
          evidencia.tipo_evidencia ===
          'video'
      ).length

    const retenciones =
      evidenciasNormalizadas
        .map(
          (evidencia) =>
            evidencia
              .fecha_retencion_hasta
        )
        .filter(Boolean)
        .sort()

    return res.json({
      ok: true,
      id_evaluacion:
        idEvaluacion,

      resumen: {
        total_evidencias:
          evidenciasNormalizadas.length,

        capturas,
        logs_tecleo:
          logsTecleo,
        videos,

        total_indicios:
          detecciones.length,

        retencion_hasta:
          retenciones.length > 0
            ? retenciones[
                retenciones.length - 1
              ]
            : null,
      },

      evidencias:
        evidenciasNormalizadas,

      detecciones,
    })
  } catch (error) {
    console.error(
      'Consulta de evidencias:',
      error
    )

    return res.status(500).json({
      error:
        'No fue posible consultar las evidencias',
    })
  }
}


/*
 * POST /api/exam/detecciones
 */
async function registrarDeteccionFraude(
  req,
  res
) {
  const conexion =
    await pool.getConnection()

  try {
    const idEvaluacion =
      obtenerIdEvaluacion(
        req.body.id_evaluacion
      )

    const idEvidencia =
      Number(req.body.id_evidencia)

    const tipoIndicio =
      String(
        req.body.tipo_indicio || ''
      ).trim()

    const descripcion =
      String(
        req.body.descripcion || ''
      ).trim()

    const severidad =
      String(
        req.body.severidad ||
        'media'
      )
        .trim()
        .toLowerCase()

    const severidadesValidas = [
      'baja',
      'media',
      'alta',
      'critica',
    ]

    if (!idEvaluacion) {
      return res.status(400).json({
        error:
          'id_evaluacion inválido',
      })
    }

    if (
      !Number.isInteger(
        idEvidencia
      ) ||
      idEvidencia <= 0
    ) {
      return res.status(400).json({
        error:
          'id_evidencia inválido',
      })
    }

    if (!tipoIndicio) {
      return res.status(400).json({
        error:
          'tipo_indicio es obligatorio',
      })
    }

    if (
      !severidadesValidas.includes(
        severidad
      )
    ) {
      return res.status(400).json({
        error:
          'La severidad debe ser baja, media, alta o critica',
      })
    }

    await conexion.beginTransaction()

    const [evidencias] =
      await conexion.query(
        `
        SELECT id_evidencia
        FROM EvidenciaAntifraude
        WHERE id_evidencia = ?
          AND id_evaluacion = ?
        FOR UPDATE
        `,
        [
          idEvidencia,
          idEvaluacion,
        ]
      )

    if (evidencias.length === 0) {
      await conexion.rollback()

      return res.status(404).json({
        error:
          'La evidencia no existe o no pertenece a la evaluación',
      })
    }

    const [resultado] =
      await conexion.query(
        `
        INSERT INTO DeteccionFraude (
          id_evaluacion,
          id_evidencia,
          tipo_indicio,
          descripcion,
          severidad,
          estado_revision,
          fecha_deteccion
        )
        VALUES (
          ?, ?, ?, ?, ?,
          'pendiente', NOW()
        )
        `,
        [
          idEvaluacion,
          idEvidencia,
          tipoIndicio,
          descripcion || null,
          severidad,
        ]
      )

    await conexion.commit()

    let notificacion = {
      intentada: true,
      enviada: false,
    }

    try {
      await notificarDeteccionFraude({
        idEvaluacion,
        severidad,

        descripcion:
          descripcion ||
          tipoIndicio,
      })

      notificacion = {
        intentada: true,
        enviada: true,
      }
    } catch (
      errorNotificacion
    ) {
      console.error(
        'Detección registrada, pero no se pudo enviar la alerta:',
        errorNotificacion.message
      )

      notificacion = {
        intentada: true,
        enviada: false,

        advertencia:
          'La detección fue registrada, pero la alerta por correo no pudo enviarse.',
      }
    }

    return res.status(201).json({
      ok: true,

      mensaje:
        'Detección antifraude registrada correctamente',

      deteccion: {
        id_deteccion:
          resultado.insertId,

        id_evaluacion:
          idEvaluacion,

        id_evidencia:
          idEvidencia,

        tipo_indicio:
          tipoIndicio,

        descripcion:
          descripcion || null,

        severidad,

        estado_revision:
          'pendiente',
      },

      notificacion,
    })
  } catch (error) {
    await conexion.rollback()

    console.error(
      'Registro de detección antifraude:',
      error
    )

    return res.status(500).json({
      error:
        'No fue posible registrar la detección antifraude',
    })
  } finally {
    conexion.release()
  }
}

module.exports = {
  saveScreenshot,
  saveKeystrokes,
  saveVideo,
  uploadMiddleware,
  getEvidencias,
  registrarDeteccionFraude,
}
