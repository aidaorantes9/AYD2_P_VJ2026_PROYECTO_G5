// segun la convencion de JS pues la idea es trabajarlo de manera ordenada y el controller va de un lado 
// y la parte de rutas pues va en otro verdad 
const express = require('express');
const router = express.Router();

const {
    procesarArchivo
} = require('../controllers/ingestionController');

// la ruta establecida para ejecutar la cadena de filtros sobre un archivo de prueba
router.post('/procesar-archivo', procesarArchivo);

module.exports = router;