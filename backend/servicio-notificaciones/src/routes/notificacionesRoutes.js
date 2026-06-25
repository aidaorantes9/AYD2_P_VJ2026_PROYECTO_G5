// Rutas HTTP del servicio transversal de notificaciones.
// Estas rutas pueden ser consumidas por certificación, antifraude, frontend u otros módulos
const express = require('express')

const {
    enviarCorreo,
    verificarConexionSMTP,
} = require('../services/correoServicio')

const router = express.Router()

// Verifica si las credenciales SMTP funcionan correctamente.
router.get('/smtp/verificar', async (req, res) => {
    try {
        const resultado = await verificarConexionSMTP()

        return res.status(200).json({
            ok: true,
            servicio: 'servicio-notificaciones',
            tarea: 'F3-17 Servicio SMTP transversal',
            resultado,
        })
    } catch (error) {
        console.error('Error verificando SMTP:', error)

        return res.status(500).json({
            ok: false,
            error: 'No fue posible verificar la conexión SMTP.',
            detalle: error.message,
        })
    }
})

// Envía un correo genérico.
// Sirve para que cualquier módulo mande una notificación simple.
router.post('/enviar', async (req, res) => {
    try {
        const { destinatarios, asunto, mensaje, html } = req.body

        const resultado = await enviarCorreo({
            destinatarios,
            asunto,
            mensaje,
            html,
        })

        return res.status(200).json({
            ok: true,
            servicio: 'servicio-notificaciones',
            tarea: 'F3-17 Servicio SMTP transversal',
            mensaje: 'Correo enviado correctamente.',
            resultado,
        })
    } catch (error) {
        console.error('Error enviando correo:', error)

        return res.status(500).json({
            ok: false,
            error: 'No fue posible enviar el correo.',
            detalle: error.message,
        })
    }
})

// Envía una notificación cuando se genera una credencial digital
// Este endpoint lo puede consumir el módulo de certificación
router.post('/certificado', async (req, res) => {
    try {
        const {
            destinatario,
            nombre_candidato,
            codigo_verificacion,
            hash_criptografico,
            url_verificacion,
        } = req.body

        // Asunto específico para certificados.
        const asunto = 'Credencial PRCCD generada correctamente'

        // Versión de texto plano del correo.
        const mensaje = `
Hola ${nombre_candidato || 'candidato'}.

Tu credencial digital de la PRCCD fue generada correctamente.

Código de verificación: ${codigo_verificacion || 'No especificado'}
Hash criptográfico: ${hash_criptografico || 'No especificado'}

PRCCD - SICA
        `.trim()

        // Versión HTML del correo para mejor presentación visual.
        const html = `
            <h2>Credencial PRCCD generada correctamente</h2>
            <p>Hola <strong>${nombre_candidato || 'candidato'}</strong>.</p>
            <p>Tu credencial digital fue generada correctamente.</p>
            <ul>
                <li><strong>Código de verificación:</strong> ${codigo_verificacion || 'No especificado'}</li>
                <li><strong>Hash criptográfico:</strong> ${hash_criptografico || 'No especificado'}</li>
                <li><strong>URL de verificación:</strong> ${url_verificacion || 'No especificada'}</li>
            </ul>
            <p>PRCCD - SICA</p>
        `

        // Envía la notificación al candidato.
        const resultado = await enviarCorreo({
            destinatarios: destinatario,
            asunto,
            mensaje,
            html,
        })

        return res.status(200).json({
            ok: true,
            servicio: 'servicio-notificaciones',
            tarea: 'F3-17 Servicio SMTP transversal',
            tipo_notificacion: 'certificado',
            mensaje: 'Notificación de certificado enviada correctamente.',
            resultado,
        })
    } catch (error) {
        console.error('Error enviando notificación de certificado:', error)

        return res.status(500).json({
            ok: false,
            error: 'No fue posible enviar la notificación de certificado.',
            detalle: error.message,
        })
    }
})

// Envía una alerta cuando el módulo antifraude detecta una anomalía.
// Este endpoint lo puede consumir el módulo antifraude.
router.post('/alerta-fraude', async (req, res) => {
    try {
        const {
            auditores,
            id_evaluacion,
            nombre_candidato,
            severidad,
            descripcion,
        } = req.body

        // Asunto con severidad para que el auditor lo identifique rápido.
        const asunto = `Alerta antifraude PRCCD - ${severidad || 'Sin severidad'}`

        // Mensaje en texto plano para compatibilidad.
        const mensaje = `
Se detectó una alerta antifraude.

Evaluación: ${id_evaluacion || 'No especificada'}
Candidato: ${nombre_candidato || 'No especificado'}
Severidad: ${severidad || 'No especificada'}
Descripción: ${descripcion || 'Sin descripción'}

PRCCD - SICA
        `.trim()

        // Mensaje HTML para clientes de correo modernos.
        const html = `
            <h2>Alerta antifraude PRCCD</h2>
            <p>Se detectó una alerta durante una evaluación.</p>
            <ul>
                <li><strong>Evaluación:</strong> ${id_evaluacion || 'No especificada'}</li>
                <li><strong>Candidato:</strong> ${nombre_candidato || 'No especificado'}</li>
                <li><strong>Severidad:</strong> ${severidad || 'No especificada'}</li>
                <li><strong>Descripción:</strong> ${descripcion || 'Sin descripción'}</li>
            </ul>
            <p>PRCCD - SICA</p>
        `

        // Envía la alerta a uno o varios auditores.
        const resultado = await enviarCorreo({
            destinatarios: auditores,
            asunto,
            mensaje,
            html,
        })

        return res.status(200).json({
            ok: true,
            servicio: 'servicio-notificaciones',
            tarea: 'F3-17 Servicio SMTP transversal',
            tipo_notificacion: 'alerta_fraude',
            mensaje: 'Alerta antifraude enviada correctamente.',
            resultado,
        })
    } catch (error) {
        console.error('Error enviando alerta antifraude:', error)

        return res.status(500).json({
            ok: false,
            error: 'No fue posible enviar la alerta antifraude.',
            detalle: error.message,
        })
    }
})

// Envía un reporte consolidado a una universidad.
// Este endpoint sirve para reportar aprobados o evaluados de una institución.
router.post('/reporte-universidad', async (req, res) => {
    try {
        const {
            destinatarios,
            universidad,
            periodo,
            total_aprobados,
            total_evaluados,
        } = req.body

        // Asunto específico para reportes universitarios.
        const asunto = `Reporte PRCCD - ${universidad || 'Universidad'}`

        // Mensaje de texto plano.
        const mensaje = `
Reporte consolidado PRCCD.

Universidad: ${universidad || 'No especificada'}
Periodo: ${periodo || 'No especificado'}
Total evaluados: ${total_evaluados || 0}
Total aprobados: ${total_aprobados || 0}

PRCCD - SICA
        `.trim()

        // Mensaje HTML con datos del reporte.
        const html = `
            <h2>Reporte consolidado PRCCD</h2>
            <ul>
                <li><strong>Universidad:</strong> ${universidad || 'No especificada'}</li>
                <li><strong>Periodo:</strong> ${periodo || 'No especificado'}</li>
                <li><strong>Total evaluados:</strong> ${total_evaluados || 0}</li>
                <li><strong>Total aprobados:</strong> ${total_aprobados || 0}</li>
            </ul>
            <p>PRCCD - SICA</p>
        `

        // Envía el reporte a los destinatarios indicados.
        const resultado = await enviarCorreo({
            destinatarios,
            asunto,
            mensaje,
            html,
        })

        return res.status(200).json({
            ok: true,
            servicio: 'servicio-notificaciones',
            tarea: 'F3-17 Servicio SMTP transversal',
            tipo_notificacion: 'reporte_universidad',
            mensaje: 'Reporte universitario enviado correctamente.',
            resultado,
        })
    } catch (error) {
        console.error('Error enviando reporte universitario:', error)

        return res.status(500).json({
            ok: false,
            error: 'No fue posible enviar el reporte universitario.',
            detalle: error.message,
        })
    }
})

module.exports = router