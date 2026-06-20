const express = require("express")
const router = express.Router()

const {
  saveScreenshot,
  saveKeystrokes,
  saveVideo,
  uploadMiddleware
} = require("../controllers/exam.controller")

router.post("/screenshots", saveScreenshot)
router.post("/keystrokes", saveKeystrokes)
router.post("/video-inicial", uploadMiddleware, saveVideo)

module.exports = router