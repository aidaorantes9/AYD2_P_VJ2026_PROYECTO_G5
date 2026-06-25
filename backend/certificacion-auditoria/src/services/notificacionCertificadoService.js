const pool = require('../db');

const {
  descifrar,
} = require('../utils/cryptoDatos');

function quitarBarraFinal(valor) {
  return String(valor || '')
    .trim()
    .replace(/\/+$/, '');
}

async function obtenerDatosCandidato(
  idCandidato
) {
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
    nombre: descifrar(
      candidatos[0].nombre_cifrado
    ),
    email: descifrar(
      candidatos[0].email_cifrado
    ),
  };
}

function construirUrlVerificacion(
  codigoVerificacion
) {
  const basePublica = quitarBarraFinal(
    process.env
      .CERTIFICACION_PUBLIC_URL ||
      'http://localhost:4003'
  );

  return (
    `${basePublica}` +
    `/api/auditoria/verificar/` +
    encodeURIComponent(
      codigoVerificacion
    )
  );
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

async function notificarCertificadoEmitido({
  idCandidato,
  certificado,
}) {
  const candidato =
    await obtenerDatosCandidato(
      idCandidato
    );

  const servicioNotificaciones =
    quitarBarraFinal(
      process.env
        .NOTIFICACIONES_API_URL ||
        'http://servicio-notificaciones:4006'
    );

  const respuesta = await fetch(
    `${servicioNotificaciones}/api/notificaciones/certificado`,
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
        destinatario:
          candidato.email,

        nombre_candidato:
          candidato.nombre,

        codigo_verificacion:
          certificado
            .codigo_verificacion,

        hash_criptografico:
          certificado
            .hash_certificado,

        url_verificacion:
          construirUrlVerificacion(
            certificado
              .codigo_verificacion
          ),
      }),
    }
  );

  const resultado =
    await leerRespuesta(respuesta);

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

module.exports = {
  notificarCertificadoEmitido,
};
