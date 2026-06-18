const crypto = require('crypto');
const { canonicalJson } = require('./canonicalJson');

const HASH_ALGORITHM = 'sha256';
const HASH_INICIAL = '0'.repeat(64);

/**
 * Calcula el hash SHA-256 de cualquier contenido.
 */
function calcularHash(contenido) {
  const texto = typeof contenido === 'string'
    ? contenido
    : canonicalJson(contenido);

  return crypto
    .createHash(HASH_ALGORITHM)
    .update(texto, 'utf8')
    .digest('hex');
}

/**
 * Genera el hash de un evento enlazándolo con el evento anterior.
 */
function calcularHashEvento({
  idCertificado,
  tipoEvento,
  actor,
  detalleEvento,
  resultadoValidacion,
  fechaEvento,
  hashAnterior = null,
}) {
  const contenidoEvento = {
    id_certificado: Number(idCertificado),
    tipo_evento: tipoEvento,
    actor,
    detalle_evento: detalleEvento,
    resultado_validacion: resultadoValidacion,
    fecha_evento: fechaEvento,
    hash_anterior: hashAnterior || HASH_INICIAL,
  };

  return calcularHash(contenidoEvento);
}

module.exports = {
  HASH_ALGORITHM,
  HASH_INICIAL,
  calcularHash,
  calcularHashEvento,
};
