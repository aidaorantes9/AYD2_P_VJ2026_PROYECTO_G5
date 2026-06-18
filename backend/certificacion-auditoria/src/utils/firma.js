const crypto = require('crypto');
const { canonicalJson } = require('./canonicalJson');

const ALGORITMO_FIRMA = 'RSA-SHA256';

function obtenerBuffer(contenido) {
  const texto = typeof contenido === 'string'
    ? contenido
    : canonicalJson(contenido);

  return Buffer.from(texto, 'utf8');
}

function validarClave(clave, nombre) {
  if (typeof clave !== 'string' || clave.trim() === '') {
    throw new Error(`${nombre} es requerida`);
  }
}

/**
 * Genera un par de llaves RSA de 2048 bits.
 * La llave privada debe mantenerse fuera de la base de datos.
 */
function generarParClaves() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
}

/**
 * Firma un texto, hash u objeto JSON con la llave privada.
 */
function firmarContenido(contenido, clavePrivada) {
  validarClave(clavePrivada, 'La llave privada');

  const firmador = crypto.createSign(ALGORITMO_FIRMA);
  firmador.update(obtenerBuffer(contenido));
  firmador.end();

  return firmador.sign(clavePrivada, 'base64');
}

/**
 * Verifica que una firma corresponda al contenido y llave pública.
 */
function verificarFirma(contenido, firmaBase64, clavePublica) {
  validarClave(clavePublica, 'La llave pública');

  if (typeof firmaBase64 !== 'string' || firmaBase64.trim() === '') {
    return false;
  }

  try {
    const verificador = crypto.createVerify(ALGORITMO_FIRMA);
    verificador.update(obtenerBuffer(contenido));
    verificador.end();

    return verificador.verify(
      clavePublica,
      firmaBase64,
      'base64'
    );
  } catch {
    return false;
  }
}

module.exports = {
  ALGORITMO_FIRMA,
  generarParClaves,
  firmarContenido,
  verificarFirma,
};
