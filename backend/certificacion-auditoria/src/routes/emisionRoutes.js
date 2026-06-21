const express = require('express');
const {
  emitirCertificado,
} = require('../services/emisionService');

const router = express.Router();

/**
 * POST /api/certificados/emitir
 * Genera un certificado firmado y registra su evento de emisión.
 */
router.post('/emitir', async (req, res) => {
  try {
    const {
      id_candidato,
      id_evaluacion = null,
      datos_certificado,
      actor = 'Sistema PRCCD',
    } = req.body;

    const certificado = await emitirCertificado({
      idCandidato: id_candidato,
      idEvaluacion: id_evaluacion,
      datosCertificado: datos_certificado,
      actor,
    });

    return res.status(201).json({
      mensaje: 'Certificado emitido correctamente',
      certificado,
    });
  } catch (error) {
    if (error.code === 'CANDIDATO_NO_ENCONTRADO') {
      return res.status(404).json({
        error: error.message,
      });
    }

    if (
      error.message ===
      'Solo se puede emitir un certificado para un resultado APROBADO'
    ) {
      return res.status(403).json({
        error: error.message,
      });
    }

    if (
      error.message.includes('id del candidato') ||
      error.message.includes('id de la evaluación') ||
      error.message.includes('datos del certificado')
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error('Error emitiendo certificado:', error);

    return res.status(500).json({
      error: 'No fue posible emitir el certificado',
    });
  }
});

module.exports = router;
