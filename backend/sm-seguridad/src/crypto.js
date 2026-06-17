// modulo para cifrar y descifrar datos sensibles con AES-256-CBC
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// la llave debe ser de 32 bytes en hex (64 caracteres)
const KEY = Buffer.from(process.env.AES_KEY, 'hex');
// el vector de inicializacion debe ser de 16 bytes en hex (32 caracteres)
const IV  = Buffer.from(process.env.AES_IV,  'hex');

// cifra un texto plano y devuelve un buffer binario
function cifrar(texto) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  return cifrado;
}

// descifra un buffer binario y devuelve el texto original
function descifrar(buffer) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  const descifrado = Buffer.concat([decipher.update(buffer), decipher.final()]);
  return descifrado.toString('utf8');
}

module.exports = { cifrar, descifrar };