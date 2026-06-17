// Se importa Express para crear el servidor
const express = require('express');

// Se cargan las variables de entorno desde .env
require('dotenv').config();

// Se importan las rutas del módulo de autenticación
const authRoutes = require('./routes/authRoutes');

// siguiendo pues la misma logica de organizacion, se importa la ruta de integracion que se ha trabajado en la tarea 4
const ingestionRoutes = require('./routes/ingestionRoutes');

// Se inicializa la aplicación de Express
const app = express();

// Se habilita la lectura de JSON en las peticiones
app.use(express.json());

// Ruta simple para comprobar que el servicio está levantado
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        modulo: 'Integracion e Ingesta',
        dev: 'Kevin',
        carnet: '202101007'
    });
});

// Se agrupan las rutas de integración bajo un mismo prefijo
app.use('/api/integracion', authRoutes);

// sobre la tarea 4: 
app.use('/api/integracion/ingesta', ingestionRoutes);

// Se usa el puerto definido en .env o el puerto 4002 acordado para mi persona (202101007/Kevin)
const PORT = process.env.PORT || 4002;

// Se levanta el servidor
app.listen(PORT, () => {
    console.log(`Modulo Dev 2 ejecutandose en puerto ${PORT}`);
});