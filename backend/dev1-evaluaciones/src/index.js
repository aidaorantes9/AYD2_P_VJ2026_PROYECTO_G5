require('dotenv').config();

const express = require('express');
const cors = require('cors');

const evaluacionRoutes = require('./routers/evaluacion');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://136.114.93.149:5173',
  })
);

app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({
    servicio: 'dev1-evaluaciones',
    estado: 'disponible',
    puerto: PORT,
  });
});

app.use('/api/evaluacion', evaluacionRoutes);

app.listen(PORT, () => {
  console.log(`Motor de evaluaciones ejecutándose en http://136.114.93.149:${PORT}`);
});