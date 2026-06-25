const pool = require('../db')

const {
  descifrar,
} = require('../utils/cryptoDatos')

function quitarBarraFinal(valor) {
  return String(valor || '')
    .trim()
    .replace(/\/+$/, '')
}

function obtenerAuditores() {
  return String(
    process.env.AUDITORES_ALERTA || ''
  )
    .split(/[,;]/)
    .map((correo) => correo.trim())
    .filter(Boolean)
}

async function obtenerCandidato(
  idEvaluacion
) {
  const [resultados] =
    await pool.query(
      `
      SELECT
        e.id_candidato,
        cs.nombre_cifrado
      FROM Evaluacion e
      INNER JOIN CandidatoSeguridad cs
        ON cs.id = e.id_candidato
      WHERE e.id_evaluacion = ?
      LIMIT 1
      `,
      [idEvaluacion]
    )

  if (resultados.length === 0) {
    throw new Error(
      'No se encontró el candidato asociado a la evaluación'
    )
  }

  return {
    id_candidato:
      resultados[0].id_candidato,

    nombre:
      descifrar(
        resultados[0].nombre_cifrado
      ),
  }
}

async function leerRespuesta(respuesta) {
  const texto = await respuesta.text()

  if (!texto) {
    return {}
  }

  try {
    return JSON.parse(texto)
  } catch {
    return {
      detalle: texto,
    }
  }
}

async function notificarDeteccionFraude({
  idEvaluacion,
  severidad,
  descripcion,
}) {
  const auditores =
    obtenerAuditores()

  if (auditores.length === 0) {
    throw new Error(
      'No existen auditores configurados en AUDITORES_ALERTA'
    )
  }

  const candidato =
    await obtenerCandidato(
      idEvaluacion
    )

  const servicio =
    quitarBarraFinal(
      process.env
        .NOTIFICACIONES_API_URL ||
        'http://servicio-notificaciones:4006'
    )

  const respuesta = await fetch(
    `${servicio}/api/notificaciones/alerta-fraude`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      signal: AbortSignal.timeout(
        Number(
          process.env
            .NOTIFICACIONES_TIMEOUT_MS ||
            10000
        )
      ),

      body: JSON.stringify({
        auditores,

        id_evaluacion:
          idEvaluacion,

        nombre_candidato:
          candidato.nombre,

        severidad,
        descripcion,
      }),
    }
  )

  const resultado =
    await leerRespuesta(respuesta)

  if (!respuesta.ok) {
    throw new Error(
      resultado.detalle ||
      resultado.error ||
      `El servicio de notificaciones respondió ${respuesta.status}`
    )
  }

  return {
    enviada: true,
    tipo: 'alerta_fraude',
  }
}

module.exports = {
  notificarDeteccionFraude,
}
