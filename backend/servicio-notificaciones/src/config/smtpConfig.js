// Archivo encargado de leer y validar la configuración SMTP
// Todas las credenciales se leen desde variables de entorno
function obtenerConfigSMTP() {
    // Convierte el puerto del .env a número
    const puerto = Number(process.env.SMTP_PORT || 2525)

    // Convierte SMTP_SECURE a booleano.
    // true se usa normalmente con puerto 465.
    const seguro = String(process.env.SMTP_SECURE || 'false') === 'true'

    // Configuración que Nodemailer usará para conectarse al proveedor SMTP.
    return {
        host: process.env.SMTP_HOST,
        port: puerto,
        secure: seguro,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    }
}

function validarConfigSMTP() {
    // Variables mínimas necesarias para enviar correos.
    const variablesRequeridas = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'SMTP_FROM',
    ]

    // Detecta variables vacías o no definidas.
    const faltantes = variablesRequeridas.filter((variable) => {
        return !process.env[variable]
    })

    // Si falta algo, se detiene el envío para evitar errores confusos.
    if (faltantes.length > 0) {
        throw new Error(
            `Faltan variables SMTP requeridas: ${faltantes.join(', ')}`
        )
    }
}

function obtenerRemitente() {
    // Nombre visible del remitente.
    const nombre = process.env.SMTP_FROM_NAME || 'PRCCD SICA'

    // Correo desde donde saldrá la notificación.
    const correo = process.env.SMTP_FROM

    // Formato estándar: "Nombre" <correo@dominio.com>
    return `"${nombre}" <${correo}>`
}

module.exports = {
    obtenerConfigSMTP,
    validarConfigSMTP,
    obtenerRemitente,
}