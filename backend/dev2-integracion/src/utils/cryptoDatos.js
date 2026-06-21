const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';

function obtenerConfiguracion() {
  const clave = Buffer.from(process.env.AES_KEY || '', 'hex');
  const iv = Buffer.from(process.env.AES_IV || '', 'hex');

  if (clave.length !== 32) {
    throw new Error('AES_KEY debe tener 64 caracteres hexadecimales');
  }

  if (iv.length !== 16) {
    throw new Error('AES_IV debe tener 32 caracteres hexadecimales');
  }

  return { clave, iv };
}

function cifrar(texto) {
  const { clave, iv } = obtenerConfiguracion();
  const cipher = crypto.createCipheriv(ALGORITMO, clave, iv);

  return Buffer.concat([
    cipher.update(String(texto), 'utf8'),
    cipher.final(),
  ]);
}

function descifrar(valorCifrado) {
  const { clave, iv } = obtenerConfiguracion();
  const decipher = crypto.createDecipheriv(ALGORITMO, clave, iv);

  return Buffer.concat([
    decipher.update(valorCifrado),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = {
  cifrar,
  descifrar,
};
