// punto de entrada del servidor de seguridad transversal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app     = express();

// permite recibir JSON en el body de las peticiones
app.use(express.json());

// permite que el frontend en puerto 5173 pueda llamar a este servidor
app.use(cors({ origin: 'http://localhost:5173' }));

// rutas del modulo de seguridad
const seguridadRoutes = require('./routes/seguridad');
app.use('/api/seguridad', seguridadRoutes);

// iniciar el servidor en el puerto definido en el .env
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`SM Seguridad corriendo en puerto ${PORT}`);
});