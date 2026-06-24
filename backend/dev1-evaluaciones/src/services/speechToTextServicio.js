const fs = require('fs/promises')

// Simula la conversión Speech-to-Text para la primera entrega
async function transcribirAudio({
    rutaArchivo,
    nombreOriginal,
    mimeType,
    idioma,
    textoMock,
}) {
  // Obtiene el tamaño real del archivo recibido
    const estadisticas = await fs.stat(rutaArchivo)

    /*
        Este servicio queda desacoplado del endpoint
        Luego se puede reemplazar por Whisper, Google STT
        u otro proveedor sin cambiar la ruta principal
    */
    const textoTranscrito =
        textoMock && textoMock.trim()
        ? textoMock.trim()
        : 'Audio recibido correctamente. Transcripción simulada pendiente de proveedor Speech-to-Text.'

    return {
        proveedor_stt: process.env.STT_PROVIDER || 'mock',
        texto_transcrito: textoTranscrito,
        confianza: textoMock ? 0.98 : 0.75,
        idioma: idioma || 'es-GT',
        archivo_original: nombreOriginal,
        mime_type: mimeType,
        tamanio_bytes: estadisticas.size,
    }
}

module.exports = {
    transcribirAudio,
}