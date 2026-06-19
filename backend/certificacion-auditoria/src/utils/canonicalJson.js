/**
 * Convierte un valor a JSON canónico.
 * Los objetos se ordenan alfabéticamente por clave para garantizar
 * que el mismo contenido siempre genere el mismo hash.
 */
function ordenarValor(valor) {
  if (Array.isArray(valor)) {
    return valor.map(ordenarValor);
  }

  if (valor !== null && typeof valor === 'object') {
    return Object.keys(valor)
      .sort()
      .reduce((resultado, clave) => {
        resultado[clave] = ordenarValor(valor[clave]);
        return resultado;
      }, {});
  }

  return valor;
}

function canonicalJson(valor) {
  return JSON.stringify(ordenarValor(valor));
}

module.exports = { canonicalJson };
