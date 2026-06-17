// Se importa Express para definir rutas
const express = require('express');

// Se crea un router separado para las rutas de autenticación
const router = express.Router();

// Se importa el controlador que maneja la autenticación
const {
    autenticarUniversidad
} = require('../controllers/authController');

// Ruta para probar los adaptadores de autenticación
router.post('/autenticacion', autenticarUniversidad);

// Se exporta el router para usarlo en index.js
module.exports = router;