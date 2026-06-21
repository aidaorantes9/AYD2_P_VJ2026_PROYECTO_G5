const express = require('express')

const {
  getMetricas,
} = require('../controllers/metricas.controller')

const router = express.Router()

router.get('/metricas', getMetricas)

module.exports = router
