const express = require('express')

const {
  saveScreenshot,
  saveKeystrokes,
  saveVideo,
  uploadMiddleware,
  getEvidencias,
} = require('../controllers/exam.controller')

const router = express.Router()

router.get(
  '/evidencias/:id_evaluacion',
  getEvidencias
)

router.post(
  '/screenshots',
  saveScreenshot
)

router.post(
  '/keystrokes',
  saveKeystrokes
)

router.post(
  '/video-inicial',
  uploadMiddleware,
  saveVideo
)

module.exports = router
