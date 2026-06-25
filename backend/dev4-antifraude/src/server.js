const express = require('express')
const cors = require('cors')
require('dotenv').config()

const path = require('path')

const examRoutes = require('./routes/exam.routes')
const metricasRoutes = require('./routes/metricas.routes')

const app = express()

const PORT = Number(process.env.PORT || 4004)
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
)

app.use(express.json({ limit: '50mb' }))

app.get('/api/salud', (req, res) => {
  res.json({
    ok: true,
    servicio: 'dev4-antifraude',
    modulo: 'Antifraude y Métricas',
    estado: 'disponible',
    puerto: PORT,
  })
})

app.use(
  '/api/exam/archivos',
  express.static(
    path.resolve(
      __dirname,
      'uploads'
    )
  )
)

app.use(
  '/api/exam',
  examRoutes
)


app.use('/api', metricasRoutes)

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  })
})

app.listen(PORT, () => {
  console.log(
    `Antifraude y métricas ejecutándose en http://localhost:${PORT}`
  )
})
