const pool = require('../db');
const { calcularHash } = require('../utils/hash');
const { verificarFirma } = require('../utils/firma');

function convertirDatosCertificado(datos) {
  if (datos !== null && typeof datos === 'object') {
    return datos;
  }

  try {
    return JSON.parse(datos);
  } catch {
    throw new Error('Los datos almacenados del certificado no son JSON válido');
  }
}

/**
 * Verifica criptográficamente un certificado mediante su código público.
 */
async function verificarCertificado(codigoVerificacion) {
  if (
    typeof codigoVerificacion !== 'string'
    || codigoVerificacion.trim() === ''
  ) {
    throw new Error('El código de verificación es requerido');
  }

  const [certificados] = await pool.execute(
    `SELECT
        id_certificado,
        id_candidato,
        id_evaluacion,
        codigo_verificacion,
        hash_certificado,
        algoritmo_hash,
        firma_electronica,
        clave_publica,
        datos_certificado,
        fecha_emision,
        fecha_revocacion,
        estado
     FROM Certificado
     WHERE codigo_verificacion = ?
     LIMIT 1`,
    [codigoVerificacion.trim()]
  );

  if (certificados.length === 0) {
    const error = new Error('Certificado no encontrado');
    error.code = 'CERTIFICADO_NO_ENCONTRADO';
    throw error;
  }

  const certificado = certificados[0];
  const datosCertificado = convertirDatosCertificado(
    certificado.datos_certificado
  );

  const hashCalculado = calcularHash(datosCertificado);

  const hashValido =
    hashCalculado === certificado.hash_certificado;

  const firmaValida =
    hashValido
    && verificarFirma(
      certificado.hash_certificado,
      certificado.firma_electronica,
      certificado.clave_publica
    );

  const certificadoVigente =
    certificado.estado === 'emitido'
    && certificado.fecha_revocacion === null;

  const valido =
    hashValido
    && firmaValida
    && certificadoVigente;

  return {
    valido,
    certificado: {
      id_certificado: certificado.id_certificado,
      id_candidato: certificado.id_candidato,
      id_evaluacion: certificado.id_evaluacion,
      codigo_verificacion: certificado.codigo_verificacion,
      algoritmo_hash: certificado.algoritmo_hash,
      fecha_emision: certificado.fecha_emision,
      fecha_revocacion: certificado.fecha_revocacion,
      estado: certificado.estado,
      datos: datosCertificado,
    },
    verificacion: {
      hash_almacenado: certificado.hash_certificado,
      hash_calculado: hashCalculado,
      hash_valido: hashValido,
      firma_valida: firmaValida,
      certificado_vigente: certificadoVigente,
    },
  };
}

module.exports = {
  convertirDatosCertificado,
  verificarCertificado,
};
