const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';

function obtenerConfiguracion() {
  const clave = Buffer.from(
    process.env.AES_KEY || '',
    'hex'
  );

  const iv = Buffer.from(
    process.env.AES_IV || '',
    'hex'
  );

  if (clave.length !== 32) {
    throw new Error(
      'AES_KEY debe tener 64 caracteres hexadecimales'
    );
  }

  if (iv.length !== 16) {
    throw new Error(
      'AES_IV debe tener 32 caracteres hexadecimales'
    );
  }

  return { clave, iv };
}

function descifrar(valorCifrado) {
  const { clave, iv } =
    obtenerConfiguracion();

  const decipher =
    crypto.createDecipheriv(
      ALGORITMO,
      clave,
      iv
    );

  const buffer = Buffer.isBuffer(
    valorCifrado
  )
    ? valorCifrado
    : Buffer.from(valorCifrado);

  return Buffer.concat([
    decipher.update(buffer),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = {
  descifrar,
};
