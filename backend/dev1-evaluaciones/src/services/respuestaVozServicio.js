// Normaliza texto para comparar respuestas sin acentos ni mayúsculas
function normalizarTexto(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Intenta detectar una opción cuando el candidato dice "opción A", "respuesta 1", etc
function detectarOpcionPorLetra(textoNormalizado, opciones) {

    const letras = ['a', 'b', 'c', 'd', 'e', 'f']

    for (let i = 0; i < opciones.length; i += 1) {

        const letra = letras[i]
        const numero = String(i + 1)

        const patrones = [
        `opcion ${letra}`,
        `respuesta ${letra}`,
        `inciso ${letra}`,
        letra,
        `opcion ${numero}`,
        `respuesta ${numero}`,
        numero,
        ]

        const coincide = patrones.some(
        (patron) => textoNormalizado === patron
        )

        if (coincide) {

            return opciones[i]

        }
    }

    return null
}

// Intenta detectar la opción comparando el texto transcrito con el texto de la opción
function detectarOpcionPorTexto(textoNormalizado, opciones) {

    return opciones.find((opcion) => {
        const textoOpcion = normalizarTexto(opcion.texto_opcion)

        if (!textoOpcion) {
        return false
        }

        return (
        textoNormalizado === textoOpcion ||
        textoNormalizado.includes(textoOpcion) ||
        textoOpcion.includes(textoNormalizado)
        )
    })

}

// Función principal para convertir texto transcrito en opción seleccionada
function detectarOpcionDesdeTexto(textoTranscrito, opciones) {

    const textoNormalizado = normalizarTexto(textoTranscrito)

    if (!textoNormalizado || !Array.isArray(opciones)) {
        return null
    }

    const opcionPorLetra = detectarOpcionPorLetra(
        textoNormalizado,
        opciones
    )

    if (opcionPorLetra) {
        return opcionPorLetra
    }

    return detectarOpcionPorTexto(textoNormalizado, opciones) || null

}

module.exports = {
    detectarOpcionDesdeTexto,
}