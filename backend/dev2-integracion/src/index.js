// Carga las variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');
const candidatoRoutes = require('./routes/candidatoRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

// Permite solicitudes únicamente desde el frontend configurado
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://136.114.93.149:5173',
  })
);

// Permite recibir cuerpos JSON
app.use(express.json());

// Endpoint utilizado por Docker para verificar el estado del servicio
app.get('/api/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    servicio: 'dev2-integracion',
    modulo: 'Integración e Ingesta',
    estado: 'disponible',
    puerto: PORT,
  });
});

// Autenticación federada LDAP, SAML y OAuth2
app.use('/api/integracion', authRoutes);

// Procesamiento e ingesta de archivos JSON, XML y CSV
app.use('/api/integracion/ingesta', ingestionRoutes);

// Consulta y exportación de información académica
app.use('/api/candidato', candidatoRoutes);

app.listen(PORT, () => {
  console.log(`Módulo Dev2 ejecutándose en http://136.114.93.149:${PORT}`);
});
