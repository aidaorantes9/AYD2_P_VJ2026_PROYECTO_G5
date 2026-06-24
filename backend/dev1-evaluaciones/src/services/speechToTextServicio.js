const fs = require('fs/promises')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')

const ejecutarArchivo = promisify(execFile)

// esto ya no se usara despues jaja ni modote quedo colgando 
const OPENAI_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions'

// Obtiene el proveedor configurado por variables de entorno.
function obtenerProveedorSTT() {
    return String(process.env.STT_PROVIDER || 'mock').trim().toLowerCase()
}

// Convierte es-GT, es-ES, en-US, etc. a formato ISO simple.
function normalizarIdioma(idioma) {
    if (!idioma) {
        return 'es'
    }

    return String(idioma).trim().split('-')[0].toLowerCase()
}

// Recorta errores largos para no devolver respuestas enormes.
function recortarTexto(texto, maximo = 500) {
    const valor = String(texto || '')

    if (valor.length <= maximo) {
        return valor
    }

    return `${valor.slice(0, maximo)}...`
}

// Limpia texto generado por Whisper para dejar solo la transcripción útil.
function limpiarTranscripcion(texto) {
    return String(texto || '')
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Genera una ruta temporal derivada del archivo recibido.
function construirRutaTemporal(rutaArchivo, sufijo) {
    const carpeta = path.dirname(rutaArchivo)
    const nombreBase = path.basename(rutaArchivo, path.extname(rutaArchivo))

    return path.join(carpeta, `${nombreBase}_${sufijo}`)
}

// Modo local para probar sin proveedor real.
async function transcribirConMock({
    rutaArchivo,
    nombreOriginal,
    mimeType,
    idioma,
    textoMock,
}) {
    const estadisticas = await fs.stat(rutaArchivo)

    const textoTranscrito =
        textoMock && textoMock.trim()
            ? textoMock.trim()
            : 'Audio recibido correctamente. Transcripción simulada por modo mock.'

    return {
        proveedor_stt: 'mock',
        modelo_stt: 'mock-local',
        texto_transcrito: textoTranscrito,
        confianza: textoMock ? 0.98 : 0.75,
        idioma: idioma || 'es-GT',
        archivo_original: nombreOriginal,
        mime_type: mimeType,
        tamanio_bytes: estadisticas.size,
        modo_prueba: true,
    }
}

// Integración real con OpenAI. Se conserva por si luego tienen cuota.
async function transcribirConOpenAI({
    rutaArchivo,
    nombreOriginal,
    mimeType,
    idioma,
}) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
        throw new Error(
            'OPENAI_API_KEY no está configurada. Configure la variable o use STT_PROVIDER=mock o STT_PROVIDER=whisper_local.'
        )
    }

    if (
        typeof fetch !== 'function' ||
        typeof FormData !== 'function' ||
        typeof Blob !== 'function'
    ) {
        throw new Error(
            'La integración Speech-to-Text requiere Node.js 18 o superior.'
        )
    }

    const estadisticas = await fs.stat(rutaArchivo)
    const bufferAudio = await fs.readFile(rutaArchivo)

    const modelo = process.env.STT_MODEL || 'whisper-1'
    const idiomaNormalizado = normalizarIdioma(idioma)
    const nombreArchivo = nombreOriginal || `audio${path.extname(rutaArchivo) || '.webm'}`

    const archivoBlob = new Blob([bufferAudio], {
        type: mimeType || 'application/octet-stream',
    })

    const formData = new FormData()

    formData.append('file', archivoBlob, nombreArchivo)
    formData.append('model', modelo)
    formData.append('response_format', 'json')
    formData.append('language', idiomaNormalizado)

    if (process.env.STT_PROMPT) {
        formData.append('prompt', process.env.STT_PROMPT)
    }

    const respuesta = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    })

    if (!respuesta.ok) {
        const detalle = await respuesta.text().catch(() => '')
        throw new Error(
            `El proveedor Speech-to-Text respondió ${respuesta.status}: ${recortarTexto(detalle)}`
        )
    }

    const data = await respuesta.json()
    const textoTranscrito = String(data.text || '').trim()

    if (!textoTranscrito) {
        throw new Error('El proveedor Speech-to-Text no devolvió texto transcrito.')
    }

    return {
        proveedor_stt: 'openai',
        modelo_stt: modelo,
        texto_transcrito: textoTranscrito,
        confianza: null,
        idioma: idioma || 'es-GT',
        archivo_original: nombreOriginal,
        mime_type: mimeType,
        tamanio_bytes: estadisticas.size,
        modo_prueba: false,
    }
}

// Integración gratuita usando Whisper local por medio de whisper.cpp.
async function transcribirConWhisperLocal({
    rutaArchivo,
    nombreOriginal,
    mimeType,
    idioma,
}) {
    const estadisticas = await fs.stat(rutaArchivo)

    const whisperBin = process.env.WHISPER_CPP_BIN || '/opt/whisper.cpp/build/bin/whisper-cli'
    const whisperModel = process.env.WHISPER_CPP_MODEL || '/opt/whisper.cpp/models/ggml-base.bin'
    const hilos = String(process.env.WHISPER_CPP_THREADS || 4)
    const idiomaNormalizado = normalizarIdioma(idioma)

    const rutaWav = construirRutaTemporal(rutaArchivo, 'convertido.wav')
    const prefijoSalida = construirRutaTemporal(rutaArchivo, 'transcripcion')
    const rutaTxt = `${prefijoSalida}.txt`

    try {
        // Convierte cualquier audio recibido a WAV mono 16 kHz PCM 16-bit.
        await ejecutarArchivo('ffmpeg', [
            '-y',
            '-i',
            rutaArchivo,
            '-ar',
            '16000',
            '-ac',
            '1',
            '-c:a',
            'pcm_s16le',
            rutaWav,
        ])

        // Ejecuta Whisper localmente sin API key ni proveedor externo.
        await ejecutarArchivo(whisperBin, [
            '-m',
            whisperModel,
            '-f',
            rutaWav,
            '-l',
            idiomaNormalizado,
            '-t',
            hilos,
            '-otxt',
            '-of',
            prefijoSalida,
            '-nt',
        ])

        const textoArchivo = await fs.readFile(rutaTxt, 'utf8')
        const textoTranscrito = limpiarTranscripcion(textoArchivo)

        if (!textoTranscrito) {
            throw new Error('Whisper local no devolvió texto transcrito.')
        }

        return {
            proveedor_stt: 'whisper_local',
            modelo_stt: process.env.STT_MODEL || 'base',
            texto_transcrito: textoTranscrito,
            confianza: null,
            idioma: idioma || 'es-GT',
            archivo_original: nombreOriginal,
            mime_type: mimeType,
            tamanio_bytes: estadisticas.size,
            modo_prueba: false,
        }
    } finally {
        await fs.unlink(rutaWav).catch(() => {})
        await fs.unlink(rutaTxt).catch(() => {})
    }
}

// Función principal usada por el endpoint /api/evaluacion/respuesta-audio.
async function transcribirAudio({
    rutaArchivo,
    nombreOriginal,
    mimeType,
    idioma,
    textoMock,
}) {
    const proveedor = obtenerProveedorSTT()

    if (proveedor === 'mock') {
        return transcribirConMock({
            rutaArchivo,
            nombreOriginal,
            mimeType,
            idioma,
            textoMock,
        })
    }

    if (proveedor === 'openai') {
        return transcribirConOpenAI({
            rutaArchivo,
            nombreOriginal,
            mimeType,
            idioma,
        })
    }

    if (proveedor === 'whisper_local') {
        return transcribirConWhisperLocal({
            rutaArchivo,
            nombreOriginal,
            mimeType,
            idioma,
        })
    }

    throw new Error(`Proveedor Speech-to-Text no soportado: ${proveedor}`)
}

module.exports = {
    transcribirAudio,
}