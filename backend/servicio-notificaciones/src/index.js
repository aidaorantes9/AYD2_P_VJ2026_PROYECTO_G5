// Punto de entrada del servicio transversal de notificaciones
// Aquí se configura Express, CORS, JSON y las rutas principales
require('dotenv').config()

const express = require('express')
const cors = require('cors')

const notificacionesRoutes = require('./routes/notificacionesRoutes')

const app = express()

// Puerto del servicio. Por defecto será 4006.
const PORT = process.env.PORT || 4006

// URL permitida para consumir el servicio desde el frontend.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://136.114.93.149:5173'

// Habilita CORS solamente para el frontend configurado.
app.use(cors({
    origin: FRONTEND_URL,
}))

// Permite recibir cuerpos JSON en las peticiones HTTP.
app.use(express.json({ limit: '2mb' }))

// Endpoint de salud usado por Docker y por pruebas manuales.
app.get('/api/salud', (req, res) => {
    return res.status(200).json({
        servicio: 'servicio-notificaciones',
        estado: 'disponible',
        puerto: PORT,

        // Estos campos solo indican si la variable existe.
        // No exponen valores sensibles.
        smtp_host_configurado: Boolean(process.env.SMTP_HOST),
        smtp_user_configurado: Boolean(process.env.SMTP_USER),

        tarea: 'F3-17 Servicio SMTP transversal',
    })
})

// Monta todas las rutas de notificaciones bajo /api/notificaciones.
app.use('/api/notificaciones', notificacionesRoutes)

// Maneja cualquier ruta inexistente del servicio.
app.use((req, res) => {
    return res.status(404).json({
        ok: false,
        error: 'Ruta no encontrada en servicio-notificaciones.',
    })
})

// Levanta el servidor HTTP.
app.listen(PORT, () => {
    console.log(`Servicio de notificaciones disponible en puerto ${PORT}`)
})