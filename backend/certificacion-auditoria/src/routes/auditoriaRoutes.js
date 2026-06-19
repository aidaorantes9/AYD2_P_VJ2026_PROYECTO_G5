const express = require('express');
const {
  validarRastroAuditoria,
} = require('../services/auditoriaService');

const router = express.Router();

/**
 * GET /api/auditoria/verificar/:codigo
 * Valida la integridad del certificado y toda su cadena de auditoría.
 */
router.get('/verificar/:codigo', async (req, res) => {
  try {
    const resultado = await validarRastroAuditoria(
      req.params.codigo
    );

    return res
      .status(resultado.valido ? 200 : 422)
      .json({
        mensaje: resultado.valido
          ? 'Rastro de auditoría válido'
          : 'Se detectaron anomalías en el rastro de auditoría',
        ...resultado,
      });
  } catch (error) {
    if (error.code === 'CERTIFICADO_NO_ENCONTRADO') {
      return res.status(404).json({
        valido: false,
        fraude_detectado: false,
        error: error.message,
      });
    }

    console.error(
      'Error validando rastro de auditoría:',
      error
    );

    return res.status(500).json({
      valido: false,
      fraude_detectado: false,
      error: 'No fue posible validar el rastro de auditoría',
    });
  }
});

module.exports = router;
