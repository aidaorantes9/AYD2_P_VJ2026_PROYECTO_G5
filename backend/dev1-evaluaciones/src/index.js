require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const evaluacionRoutes = require('./routers/evaluacion');

const app  = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/api/evaluacion', evaluacionRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Motor de Evaluaciones activo — Lizz 201708997', puerto: PORT });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});