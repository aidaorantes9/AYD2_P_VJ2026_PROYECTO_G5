const express = require('express');

const {
  emitirCertificado,
} = require('../services/emisionService');

const {
  notificarCertificadoEmitido,
  notificarReporteUniversidad,
} = require(
  '../services/notificacionCertificadoService'
);

const router = express.Router();

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

router.post('/emitir', async (req, res) => {
  try {
    const {
      id_candidato,
      id_evaluacion,
      actor = 'Sistema PRCCD',
      datos_certificado = {},
    } = req.body;

    const idCandidato =
      Number(id_candidato);

    const idEvaluacion =
      Number(id_evaluacion);

    const certificado =
      await emitirCertificado({
        idCandidato,
        idEvaluacion,

        datosCertificado:
          datos_certificado,

        actor,
      });

    let notificacion = {
      intentada: false,
      enviada: false,
    };

    let reporteUniversidad = {
      intentada: false,
      enviada: false,
    };

    /*
      Para la demostración se envía siempre el correo de credencial,
      aunque el certificado ya exista, porque el candidato debe recibir
      nuevamente su enlace/hash de verificación.
    */
    try {
      await notificarCertificadoEmitido({
        idCandidato,
        certificado,
      });

      notificacion = {
        intentada: true,
        enviada: true,
      };
    } catch (errorNotificacion) {
      console.error(
        'Certificado emitido, pero no se pudo enviar la notificación:',
        errorNotificacion.message
      );

      notificacion = {
        intentada: true,
        enviada: false,
        advertencia:
          'El certificado fue emitido, pero el correo al candidato no pudo enviarse.',
      };
    }

    /*
     * Mailtrap free limita correos por segundo.
     * Se espera antes de enviar el reporte universitario
     * para no mandar dos correos al mismo tiempo.
     */
    await esperar(5000);

    try {
      await notificarReporteUniversidad({
        idCandidato,
        idEvaluacion,
      });

      reporteUniversidad = {
        intentada: true,
        enviada: true,
      };
    } catch (errorReporte) {
      console.error(
        'Certificado emitido, pero no se pudo enviar el reporte universitario:',
        errorReporte.message
      );

      reporteUniversidad = {
        intentada: true,
        enviada: false,
        advertencia:
          'El certificado fue emitido, pero el reporte universitario no pudo enviarse.',
      };
    }

    return res
      .status(
        certificado.reutilizado
          ? 200
          : 201
      )
      .json({
        mensaje:
          certificado.reutilizado
            ? 'El certificado ya existía y fue recuperado correctamente'
            : 'Certificado emitido correctamente',

        certificado,
        notificacion,
        reporte_universidad: reporteUniversidad,
      });
  } catch (error) {
    const estados = {
      SOLICITUD_INVALIDA: 400,
      CANDIDATO_NO_ENCONTRADO: 404,
      EVALUACION_NO_ENCONTRADA: 404,
      EVALUACION_NO_APROBADA: 403,
      GDPR_NO_ENCONTRADO: 409,
      GDPR_NO_ACTIVO: 403,
    };

    const estado =
      estados[error.code] || 500;

    if (estado === 500) {
      console.error(
        'Error emitiendo certificado:',
        error
      );
    }

    return res.status(estado).json({
      error:
        estado === 500
          ? 'No fue posible emitir el certificado'
          : error.message,

      codigo:
        error.code ||
        'ERROR_INTERNO',
    });
  }
});

module.exports = router;