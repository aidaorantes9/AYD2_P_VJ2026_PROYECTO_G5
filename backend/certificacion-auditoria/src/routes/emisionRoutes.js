const express = require('express');

const {
  emitirCertificado,
} = require('../services/emisionService');

const router = express.Router();

router.post('/emitir', async (req, res) => {
  try {
    const {
      id_candidato,
      id_evaluacion,
      actor = 'Sistema PRCCD',
      datos_certificado = {},
    } = req.body;

    const certificado =
      await emitirCertificado({
        idCandidato:
          Number(id_candidato),
        idEvaluacion:
          Number(id_evaluacion),
        datosCertificado:
          datos_certificado,
        actor,
      });

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
