const fs = require('fs');
const path = require('path');

function normalizarPem(valor) {
  return valor.replace(/\\n/g, '\n').trim();
}

function leerClave({
  variableContenido,
  variableRuta,
  nombreClave,
}) {
  const contenido = process.env[variableContenido];

  if (contenido && contenido.trim() !== '') {
    return normalizarPem(contenido);
  }

  const rutaConfigurada = process.env[variableRuta];

  if (!rutaConfigurada || rutaConfigurada.trim() === '') {
    throw new Error(
      `${nombreClave} no está configurada. Use ${variableContenido} o ${variableRuta}`
    );
  }

  const rutaAbsoluta = path.resolve(rutaConfigurada);

  if (!fs.existsSync(rutaAbsoluta)) {
    throw new Error(
      `No se encontró el archivo de ${nombreClave}: ${rutaAbsoluta}`
    );
  }

  return fs.readFileSync(rutaAbsoluta, 'utf8').trim();
}

function cargarClavePrivada() {
  return leerClave({
    variableContenido: 'PRIVATE_KEY',
    variableRuta: 'PRIVATE_KEY_PATH',
    nombreClave: 'la llave privada',
  });
}

function cargarClavePublica() {
  return leerClave({
    variableContenido: 'PUBLIC_KEY',
    variableRuta: 'PUBLIC_KEY_PATH',
    nombreClave: 'la llave pública',
  });
}

module.exports = {
  normalizarPem,
  cargarClavePrivada,
  cargarClavePublica,
};
