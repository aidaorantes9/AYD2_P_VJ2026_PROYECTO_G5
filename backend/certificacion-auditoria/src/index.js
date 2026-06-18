require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const verificacionRoutes = require('./routes/verificacionRoutes');

const app = express();
const PORT = Number(process.env.PORT || 4006);

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.get('/api/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    return res.json({
      servicio: 'certificacion-auditoria',
      estado: 'disponible',
    });
  } catch (error) {
    return res.status(503).json({
      servicio: 'certificacion-auditoria',
      estado: 'sin conexión a base de datos',
    });
  }
});

app.use('/api/certificados', verificacionRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

const server = app.listen(PORT, () => {
  console.log(
    `Certificación y auditoría ejecutándose en http://localhost:${PORT}`
  );
});

async function cerrarServidor() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', cerrarServidor);
process.on('SIGTERM', cerrarServidor);
