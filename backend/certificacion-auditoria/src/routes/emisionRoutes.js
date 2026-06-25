const express = require('express');

const {
  emitirCertificado,
} = require('../services/emisionService');

const {
  notificarCertificadoEmitido,
} = require(
  '../services/notificacionCertificadoService'
);

const router = express.Router();

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

    const certificado =
      await emitirCertificado({
        idCandidato,

        idEvaluacion:
          Number(id_evaluacion),

        datosCertificado:
          datos_certificado,

        actor,
      });

    let notificacion = {
      intentada: false,
      enviada: false,
    };

    /*
     * Solo se envía el correo cuando
     * el certificado acaba de crearse.
     * Si se reutiliza uno existente,
     * se evita mandar correos duplicados.
     */
    if (!certificado.reutilizado) {
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
            'El certificado fue emitido, pero el correo no pudo enviarse.',
        };
      }
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
