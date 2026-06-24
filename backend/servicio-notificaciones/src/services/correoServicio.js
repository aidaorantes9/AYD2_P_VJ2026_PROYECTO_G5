// Servicio centralizado para enviar correos con Nodemailer
// Este archivo contiene la lógica reutilizable que consumirán las rutas
const nodemailer = require('nodemailer')

const {
    obtenerConfigSMTP,
    validarConfigSMTP,
    obtenerRemitente,
} = require('../config/smtpConfig')

// Se mantiene una sola instancia del transporter para reutilizar la conexión SMTP.
let transporter = null

function obtenerTransporter() {
    // Si todavía no existe transporter, se crea una vez.
    if (!transporter) {
        // Valida que existan las variables SMTP antes de intentar conectar.
        validarConfigSMTP()

        // Crea el cliente SMTP usando la configuración del .env.
        transporter = nodemailer.createTransport(obtenerConfigSMTP())
    }

    return transporter
}

function normalizarDestinatarios(destinatarios) {
    // Permite recibir varios correos como arreglo.
    if (Array.isArray(destinatarios)) {
        return destinatarios.join(', ')
    }

    // Permite recibir un único correo como string.
    return String(destinatarios || '').trim()
}

async function verificarConexionSMTP() {
    // Obtiene el cliente SMTP configurado.
    const cliente = obtenerTransporter()

    // Verifica usuario, contraseña, host y puerto.
    await cliente.verify()

    // Respuesta útil para Postman y health checks manuales.
    return {
        ok: true,
        mensaje: 'Conexión SMTP verificada correctamente.',
        host: process.env.SMTP_HOST,
        puerto: Number(process.env.SMTP_PORT || 2525),
    }
}

async function enviarCorreo({ destinatarios, asunto, mensaje, html }) {
    // Obtiene el cliente SMTP reutilizable.
    const cliente = obtenerTransporter()

    // Convierte los destinatarios a formato compatible con Nodemailer.
    const para = normalizarDestinatarios(destinatarios)

    // Valida que exista al menos un destinatario.
    if (!para) {
        throw new Error('Debe indicar al menos un destinatario.')
    }

    // Valida que el correo tenga asunto.
    if (!asunto) {
        throw new Error('Debe indicar el asunto del correo.')
    }

    // Valida que exista contenido en texto o HTML.
    if (!mensaje && !html) {
        throw new Error('Debe indicar mensaje de texto o contenido HTML.')
    }

    // Envía el correo usando el proveedor SMTP configurado.
    const resultado = await cliente.sendMail({
        from: obtenerRemitente(),
        to: para,
        subject: asunto,
        text: mensaje || '',
        html: html || undefined,
    })

    // Devuelve información técnica útil para validar el envío.
    return {
        message_id: resultado.messageId,
        aceptados: resultado.accepted || [],
        rechazados: resultado.rejected || [],
        respuesta_smtp: resultado.response,
    }
}

module.exports = {
    enviarCorreo,
    verificarConexionSMTP,
}