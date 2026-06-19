// El archivo tipico tan solo para las rutas, que lo hace para mantenerlo limpio y bonito 
// y si se quiere decir mamoncito pues hasta organizado jaja 

// Se importa Express para definir rutas
const express = require('express');

// Se crea un router específico para rutas de candidato
const router = express.Router();

// Se importa el controlador de exportación
const {
    exportarCandidato
} = require('../controllers/exportController');

// Endpoint solicitado en la tarjeta:
// GET /api/candidato/{id}/exportar?formato=json
router.get('/:id/exportar', exportarCandidato);

// Se exporta el router para usarlo en index.js
module.exports = router;