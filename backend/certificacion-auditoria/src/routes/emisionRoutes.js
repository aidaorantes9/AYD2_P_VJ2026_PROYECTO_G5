const express = require('express');

const {
  emitirCertificado,
} = require('../services/emisionService');

const {
  notificarCertificadoEmitido,
} = require('../services/notificacionCertificadoService');

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

    const idEvaluacion =
      Number(id_evaluacion);

    // Emite el certificado usando la lógica existente del módulo
    const certificado =
      await emitirCertificado({
        idCandidato,
        idEvaluacion,
        datosCertificado:
          datos_certificado,
        actor,
      });

    let notificacionCorreo = null;

    /*
      Solo se envía correo si el certificado acaba de ser creado
      Si el certificado ya existía, se evita enviar correos duplicados
    */
    if (!certificado.reutilizado) {
      try {
        // Envía el correo al candidato usando el servicio SMTP transversal
        notificacionCorreo =
          await notificarCertificadoEmitido({
            idCandidato,
            certificado,
          });
      } catch (errorNotificacion) {
        console.error(
          'Error enviando notificación de certificado:',
          errorNotificacion
        );

        /*
            El certificado ya fue emitido correctamente
            Si falla el correo, no se revierte la emisión
        */
        notificacionCorreo = {
          ok: false,
          enviado: false,
          error:
            'El certificado fue emitido, pero no se pudo enviar el correo.',
          detalle:
            errorNotificacion.message,
        };
      }
    } else {
      // esto es bastante importante porque no se notifica otra vez si el certificado ya existía
      notificacionCorreo = {
        ok: false,
        omitida: true,
        motivo:
          'El certificado ya existía. No se envió correo duplicado.',
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

        // Este campo evidencia la tarea F3-18 que ando realizando 
        notificacion_correo:
          notificacionCorreo,
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
        error.code || 'ERROR_INTERNO',
    });
  }
});

module.exports = router;