// Servicio encargado de notificar al candidato cuando se emite un certificado
// Este archivo conecta certificacion-auditoria con servicio-notificaciones
const pool = require('../db')

// URL interna del servicio de notificaciones dentro de Docker
// En Docker se usa el nombre del servicio, no localhost
const NOTIFICACIONES_API_URL = process.env.NOTIFICACIONES_API_URL || 'http://servicio-notificaciones:4006'

// Permite apagar temporalmente el envío de correos sin borrar código
const NOTIFICACIONES_CERTIFICADO_ACTIVAS = String(process.env.NOTIFICACIONES_CERTIFICADO_ACTIVAS || 'true') === 'true'

function convertirCampoTexto(valor) {

    // MySQL puede devolver VARBINARY como Buffer
    // Esta función lo convierte a texto legible
    if (Buffer.isBuffer(valor)) {
        return valor.toString('utf8')
    }

    return String(valor || '').trim()

}

function construirUrlVerificacion(codigoVerificacion) {

    // Usa una URL configurable si existe
    // Si no existe, construye el enlace con FRONTEND_URL
    const base =
        process.env.CERTIFICADO_VERIFICACION_BASE_URL ||
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificado/ver`

    // Evita doble slash al unir base + código
    const baseSinSlashFinal = base.replace(/\/$/, '')

    return `${baseSinSlashFinal}/${encodeURIComponent(codigoVerificacion)}`

}

async function obtenerDatosCandidato(idCandidato) {

    // Busca nombre y correo del candidato que recibirá el certificado
    const [candidatos] = await pool.execute(
        `
        SELECT
        id_candidato,
        nombre_cifrado,
        email_cifrado
        FROM Candidato
        WHERE id_candidato = ?
        LIMIT 1
        `,
        [idCandidato]
    )

    if (candidatos.length === 0) {

        throw new Error('No se encontró el candidato para enviar la notificación.')

    }

    const candidato = candidatos[0]

    return {
        id_candidato: candidato.id_candidato,
        nombre: convertirCampoTexto(candidato.nombre_cifrado),
        email: convertirCampoTexto(candidato.email_cifrado),
    }

}

async function leerRespuestaServicio(respuesta) {

    // aquip pues intenta leer la respuesta como JSON
    // Si no se puede, devuelve texto plano para depurar errores
    const texto = await respuesta.text()

    try {
        return JSON.parse(texto)
    } catch (error) {
        return {
        respuesta_texto: texto,
        }
    }
}

async function notificarCertificadoEmitido({
    idCandidato,
    certificado,
    }) {
    // Si el envío está desactivado por entorno, no llama al SMTP
    if (!NOTIFICACIONES_CERTIFICADO_ACTIVAS) {
        return {
        ok: false,
        omitida: true,
        motivo: 'Las notificaciones de certificado están desactivadas por entorno.',
        }
    }

    // Obtiene el correo del candidato desde la base de datos
    const candidato = await obtenerDatosCandidato(idCandidato)

    if (!candidato.email) {
        throw new Error('El candidato no tiene correo registrado.')
    }

    // Construye el enlace de verificación que irá en el correo
    const urlVerificacion = construirUrlVerificacion(
        certificado.codigo_verificacion
    )

    // Payload que consume servicio-notificaciones
    const cuerpo = {
        destinatario: candidato.email,
        nombre_candidato: candidato.nombre,
        codigo_verificacion: certificado.codigo_verificacion,
        hash_criptografico: certificado.hash_certificado,
        url_verificacion: urlVerificacion,
    }

    // Llama al endpoint especializado de notificación de certificados
    const respuesta = await fetch(
        `${NOTIFICACIONES_API_URL}/api/notificaciones/certificado`,
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo),
        }
    )

    const data = await leerRespuestaServicio(respuesta)

    // Si el servicio SMTP respondió error, se informa sin ocultarlo
    if (!respuesta.ok) {
        return {
        ok: false,
        enviado: false,
        status_notificaciones: respuesta.status,
        error: 'El servicio de notificaciones no pudo enviar el correo.',
        detalle: data,
        }
    }

    return {
        ok: true,
        enviado: true,
        destinatario: candidato.email,
        url_verificacion: urlVerificacion,
        respuesta_notificaciones: data,
    }
}

module.exports = { notificarCertificadoEmitido }
