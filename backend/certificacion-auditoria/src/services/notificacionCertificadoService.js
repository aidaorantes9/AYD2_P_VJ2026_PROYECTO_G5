const pool = require('../db');

const {
  descifrar,
} = require('../utils/cryptoDatos');

function quitarBarraFinal(valor) {
  return String(valor || '')
    .trim()
    .replace(/\/+$/, '');
}

async function leerRespuesta(respuesta) {
  const texto = await respuesta.text();

  if (!texto) {
    return {};
  }

  try {
    return JSON.parse(texto);
  } catch {
    return {
      detalle: texto,
    };
  }
}

async function obtenerDatosCandidato(idCandidato) {
  const [candidatos] =
    await pool.execute(
      `
      SELECT
        nombre_cifrado,
        email_cifrado,
        estado_gdpr
      FROM CandidatoSeguridad
      WHERE id = ?
      LIMIT 1
      `,
      [idCandidato]
    );

  if (candidatos.length === 0) {
    throw new Error(
      'No se encontraron los datos de seguridad del candidato'
    );
  }

  if (candidatos[0].estado_gdpr !== 'activo') {
    throw new Error(
      'No se puede notificar a un candidato anonimizado u olvidado'
    );
  }

  return {
    nombre: descifrar(candidatos[0].nombre_cifrado),
    email: descifrar(candidatos[0].email_cifrado),
  };
}

function construirUrlVerificacion(codigoVerificacion) {
  const basePublica = quitarBarraFinal(
    process.env.CERTIFICACION_PUBLIC_URL ||
    'http://136.114.93.149:4003'
  );

  return (
    `${basePublica}` +
    `/api/auditoria/verificar/` +
    encodeURIComponent(codigoVerificacion)
  );
}

function obtenerServicioNotificaciones() {
  return quitarBarraFinal(
    process.env.NOTIFICACIONES_API_URL ||
    'http://servicio-notificaciones:4006'
  );
}

function obtenerTimeoutNotificaciones() {
  return Number(
    process.env.NOTIFICACIONES_TIMEOUT_MS ||
    10000
  );
}

function leerTextoCandidato(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  try {
    return descifrar(valor);
  } catch {
    return Buffer.isBuffer(valor)
      ? valor.toString('utf8')
      : String(valor);
  }
}

async function notificarCertificadoEmitido({
  idCandidato,
  certificado,
}) {
  const candidato =
    await obtenerDatosCandidato(idCandidato);

  const servicioNotificaciones =
    obtenerServicioNotificaciones();

  const respuesta = await fetch(
    `${servicioNotificaciones}/api/notificaciones/certificado`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      signal: AbortSignal.timeout(
        obtenerTimeoutNotificaciones()
      ),

      body: JSON.stringify({
        destinatario: candidato.email,

        nombre_candidato: candidato.nombre,

        codigo_verificacion:
          certificado.codigo_verificacion,

        hash_criptografico:
          certificado.hash_certificado,

        url_verificacion:
          construirUrlVerificacion(
            certificado.codigo_verificacion
          ),
      }),
    }
  );

  const resultado = await leerRespuesta(respuesta);

  if (!respuesta.ok) {
    throw new Error(
      resultado.detalle ||
      resultado.error ||
      `El servicio de notificaciones respondió ${respuesta.status}`
    );
  }

  return {
    enviada: true,
    tipo: 'certificado',
  };
}

function obtenerCorreoUniversidad(idUniversidad) {
  const correosPorUniversidad = {
    1:
      process.env.REPORTE_USAC_EMAIL ||
      'reportes.usac@prccd-sica.org',

    2:
      process.env.REPORTE_UCR_EMAIL ||
      'reportes.ucr@prccd-sica.org',

    3:
      process.env.REPORTE_UES_EMAIL ||
      'reportes.ues@prccd-sica.org',
  };

  return (
    correosPorUniversidad[Number(idUniversidad)] ||
    process.env.REPORTE_UNIVERSIDAD_DEFAULT_EMAIL ||
    'reportes.universidad@prccd-sica.org'
  );
}

async function obtenerReporteUniversidad({
  idCandidato,
  idEvaluacion,
}) {
  const [datosBase] =
    await pool.execute(
      `
      SELECT
        c.id_universidad,
        u.nombre AS universidad,
        e.id_periodo,
        p.nombre AS periodo
      FROM Evaluacion e
      INNER JOIN Candidato c
        ON c.id_candidato = e.id_candidato
      INNER JOIN Universidad u
        ON u.id_universidad = c.id_universidad
      INNER JOIN PeriodoCertificacion p
        ON p.id_periodo = e.id_periodo
      WHERE e.id_evaluacion = ?
        AND c.id_candidato = ?
      LIMIT 1
      `,
      [
        idEvaluacion,
        idCandidato,
      ]
    );

  if (datosBase.length === 0) {
    throw new Error(
      'No se encontró la universidad asociada al candidato certificado'
    );
  }

  const base = datosBase[0];

  const [metricas] =
    await pool.execute(
      `
      SELECT
        COUNT(DISTINCT e.id_evaluacion) AS total_evaluados,
        SUM(
          CASE
            WHEN e.estado = 'finalizada'
             AND e.aprobada = 1
            THEN 1
            ELSE 0
          END
        ) AS total_aprobados
      FROM Evaluacion e
      INNER JOIN Candidato c
        ON c.id_candidato = e.id_candidato
      WHERE c.id_universidad = ?
        AND e.id_periodo = ?
      `,
      [
        base.id_universidad,
        base.id_periodo,
      ]
    );

  const [aprobadosDb] =
    await pool.execute(
      `
      SELECT
        e.id_evaluacion,
        e.calificacion,
        COALESCE(cs.nombre_cifrado, c.nombre_cifrado) AS nombre_cifrado,
        COALESCE(cs.email_cifrado, c.email_cifrado) AS email_cifrado
      FROM Evaluacion e
      INNER JOIN Candidato c
        ON c.id_candidato = e.id_candidato
      LEFT JOIN CandidatoSeguridad cs
        ON cs.id = c.id_candidato
      WHERE c.id_universidad = ?
        AND e.id_periodo = ?
        AND e.estado = 'finalizada'
        AND e.aprobada = 1
      ORDER BY e.id_evaluacion ASC
      `,
      [
        base.id_universidad,
        base.id_periodo,
      ]
    );

  const aprobados = aprobadosDb.map((fila) => ({
    id_evaluacion: fila.id_evaluacion,
    nombre: leerTextoCandidato(fila.nombre_cifrado),
    correo: leerTextoCandidato(fila.email_cifrado),
    calificacion: Number(fila.calificacion || 0),
  }));

  return {
    id_universidad: base.id_universidad,
    universidad: base.universidad,
    periodo: base.periodo,

    total_evaluados: Number(
      metricas[0]?.total_evaluados || 0
    ),

    total_aprobados: Number(
      metricas[0]?.total_aprobados || 0
    ),

    aprobados,

    destinatarios:
      obtenerCorreoUniversidad(base.id_universidad),
  };
}

async function notificarReporteUniversidad({
  idCandidato,
  idEvaluacion,
}) {
  const reporte =
    await obtenerReporteUniversidad({
      idCandidato,
      idEvaluacion,
    });

  const servicioNotificaciones =
    obtenerServicioNotificaciones();

  const respuesta = await fetch(
    `${servicioNotificaciones}/api/notificaciones/reporte-universidad`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      signal: AbortSignal.timeout(
        obtenerTimeoutNotificaciones()
      ),

      body: JSON.stringify({
        destinatarios: reporte.destinatarios,
        universidad: reporte.universidad,
        periodo: reporte.periodo,
        total_aprobados: reporte.total_aprobados,
        total_evaluados: reporte.total_evaluados,
        aprobados: reporte.aprobados,
      }),
    }
  );

  const resultado = await leerRespuesta(respuesta);

  if (!respuesta.ok) {
    throw new Error(
      resultado.detalle ||
      resultado.error ||
      `El servicio de notificaciones respondió ${respuesta.status}`
    );
  }

  return {
    enviada: true,
    tipo: 'reporte_universidad',
    reporte,
  };
}

module.exports = {
  notificarCertificadoEmitido,
  notificarReporteUniversidad,
};