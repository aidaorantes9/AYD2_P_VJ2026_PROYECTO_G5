const fs = require('fs')
const path = require('path')
const multer = require('multer')

// esto seria la carpeta temporal donde se guarda el audio mientras se procesa
const carpetaTemporal = path.join(
    __dirname,
    '..',
    '..',
    'tmp',
    'audio'
)

// y pues aqui se crea la carpeta temporal si todavía no existe
if (!fs.existsSync(carpetaTemporal)) {
    fs.mkdirSync(carpetaTemporal, { recursive: true })
}

// basicamente las extensiones permitidas para respuestas por voz
const extensionesPermitidas = new Set([
    '.webm',
    '.wav',
    '.mp3',
    '.m4a',
    '.ogg',
])

// Tipos MIME aceptados desde navegadores o clientes móviles
const tiposMimePermitidos = new Set([
    'audio/webm',
    'video/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg',
])

// aqui se configura dónde y con qué nombre se guarda el archivo
const almacenamiento = multer.diskStorage({

    destination: (req, file, cb) => {
    cb(null, carpetaTemporal)
    },

    filename: (req, file, cb) => {
        const extensionOriginal = path.extname(file.originalname).toLowerCase()
        const extensionFinal = extensionOriginal || '.webm'

        const nombreSeguro = `audio_${Date.now()}_${Math.round(
        Math.random() * 1e9
        )}${extensionFinal}`

        cb(null, nombreSeguro)
    },
})

// Valida que el archivo recibido realmente sea audio
function validarArchivoAudio(req, file, cb) {

    const extension = path.extname(file.originalname).toLowerCase()
    const tipoMime = file.mimetype

    const extensionValida = extensionesPermitidas.has(extension)
    const mimeValido = tiposMimePermitidos.has(tipoMime)

    if (!extensionValida && !mimeValido) {
        return cb(
        new Error(
            'Archivo inválido. Debe enviar audio en formato webm, wav, mp3, m4a u ogg.'
        )
        )
    }

    return cb(null, true)
}

// Es el limite configurable para evitar archivos demasiado grandes
const limiteMb = Number(process.env.MAX_AUDIO_MB || 15)

// Middleware principal para recibir un archivo en el campo "audio"
const uploadAudio = multer({
    storage: almacenamiento,
    fileFilter: validarArchivoAudio,
    limits: {
        fileSize: limiteMb * 1024 * 1024,
    },
})

// Envuelve multer para responder errores en formato JSON.
function cargarAudio(req, res, next) {

    uploadAudio.single('audio')(req, res, (error) => {
        if (error) {
        return res.status(400).json({
            ok: false,
            error: error.message,
        })
        }

        return next()
    })
}

module.exports = cargarAudio