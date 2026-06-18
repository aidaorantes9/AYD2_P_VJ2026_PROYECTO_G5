const express = require('express');
const {
  verificarCertificado,
} = require('../services/verificacionService');

const router = express.Router();

/**
 * GET /api/certificados/verificar/:codigo
 * Verifica hash, firma electrónica y vigencia del certificado.
 */
router.get('/verificar/:codigo', async (req, res) => {
  try {
    const resultado = await verificarCertificado(
      req.params.codigo
    );

    const estadoHttp = resultado.valido ? 200 : 422;

    return res.status(estadoHttp).json({
      mensaje: resultado.valido
        ? 'Certificado válido'
        : 'El certificado no superó la verificación criptográfica',
      ...resultado,
    });
  } catch (error) {
    if (error.code === 'CERTIFICADO_NO_ENCONTRADO') {
      return res.status(404).json({
        valido: false,
        error: error.message,
      });
    }

    if (error.message === 'El código de verificación es requerido') {
      return res.status(400).json({
        valido: false,
        error: error.message,
      });
    }

    console.error('Error verificando certificado:', error);

    return res.status(500).json({
      valido: false,
      error: 'No fue posible verificar el certificado',
    });
  }
});

module.exports = router;
