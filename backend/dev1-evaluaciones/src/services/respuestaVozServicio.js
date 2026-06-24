// Normaliza texto para comparar sin acentos, mayúsculas ni signos.
function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Define las respuestas habladas permitidas para las primeras 5 opciones.
const respuestasNumericas = [
    {
        numero: 1,
        texto: 'uno',
        variantes: ['1', 'uno', 'primero', 'primera'],
    },
    {
        numero: 2,
        texto: 'dos',
        variantes: ['2', 'dos', 'segundo', 'segunda'],
    },
    {
        numero: 3,
        texto: 'tres',
        variantes: ['3', 'tres', 'tercero', 'tercera'],
    },
    {
        numero: 4,
        texto: 'cuatro',
        variantes: ['4', 'cuatro', 'cuarto', 'cuarta'],
    },
    {
        numero: 5,
        texto: 'cinco',
        variantes: ['5', 'cinco', 'quinto', 'quinta'],
    },
]

// Crea frases válidas como "respuesta uno", "la respuesta dos" o "respuesta numero tres".
function construirPatronesRespuesta(variantes) {
    const patrones = []

    variantes.forEach((valor) => {
        patrones.push(valor)
        patrones.push(`respuesta ${valor}`)
        patrones.push(`la respuesta ${valor}`)
        patrones.push(`elijo respuesta ${valor}`)
        patrones.push(`mi respuesta es ${valor}`)
        patrones.push(`respuesta numero ${valor}`)
        patrones.push(`la respuesta numero ${valor}`)
        patrones.push(`selecciono respuesta ${valor}`)
    })

    return patrones.map(normalizarTexto)
}

// Compara frases exactas y frases contenidas en una oración corta.
function coincideConPatron(textoNormalizado, patron) {
    if (textoNormalizado === patron) {
        return true
    }

    return textoNormalizado.includes(patron)
}

// Detecta respuestas habladas como "respuesta uno", "respuesta dos", hasta "respuesta cinco".
function detectarOpcionPorRespuestaNumerica(textoNormalizado, opciones) {
    const opcionesLimitadas = opciones.slice(0, 5)

    for (let i = 0; i < opcionesLimitadas.length; i += 1) {
        const configuracion = respuestasNumericas[i]

        if (!configuracion) {
            continue
        }

        const patrones = construirPatronesRespuesta(configuracion.variantes)

        const coincide = patrones.some((patron) => {
            return coincideConPatron(textoNormalizado, patron)
        })

        if (coincide) {
            return {
                ...opcionesLimitadas[i],
                numero_detectado: configuracion.numero,
                respuesta_detectada: `Respuesta ${configuracion.texto}`,
            }
        }
    }

    return null
}

// Detecta una opción si el candidato dijo el texto exacto o una parte clara de la opción.
function detectarOpcionPorTexto(textoNormalizado, opciones) {
    const opcionesLimitadas = opciones.slice(0, 5)

    const opcionEncontrada = opcionesLimitadas.find((opcion) => {
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

    if (!opcionEncontrada) {
        return null
    }

    const indice = opcionesLimitadas.findIndex((opcion) => {
        return opcion.id_opcion === opcionEncontrada.id_opcion
    })

    const configuracion = respuestasNumericas[indice]

    return {
        ...opcionEncontrada,
        numero_detectado: configuracion ? configuracion.numero : null,
        respuesta_detectada: configuracion
            ? `Respuesta ${configuracion.texto}`
            : null,
    }
}

// Convierte la transcripción de Whisper en una opción seleccionada.
function detectarOpcionDesdeTexto(textoTranscrito, opciones) {
    const textoNormalizado = normalizarTexto(textoTranscrito)

    if (!textoNormalizado || !Array.isArray(opciones)) {
        return null
    }

    const opcionPorNumero = detectarOpcionPorRespuestaNumerica(
        textoNormalizado,
        opciones
    )

    if (opcionPorNumero) {
        return opcionPorNumero
    }

    return detectarOpcionPorTexto(textoNormalizado, opciones)
}

module.exports = {
    detectarOpcionDesdeTexto,
}