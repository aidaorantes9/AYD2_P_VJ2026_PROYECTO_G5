const fs = require("fs-extra")
const path = require("path")
const multer = require("multer")
const crypto = require("crypto")
const pool = require("./../db")

// 📁 BASE UNIFICADA DE UPLOADS
const UPLOADS = path.resolve(__dirname, "../uploads")

const SCREENSHOTS_DIR = path.join(UPLOADS, "screenshots")
const KEYSTROKES_DIR = path.join(UPLOADS, "keystrokes")
const VIDEOS_DIR = path.join(UPLOADS, "videos")

// 🔐 SHA256 helper
function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex")
}

// 📅 Fecha de retención = hoy + 5 años
function fechaRetencion() {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() + 5)
  return fecha.toISOString().split("T")[0]
}

/* =========================
   📸 SCREENSHOTS
========================= */
exports.saveScreenshot = async (req, res) => {
  try {
    const { image, id_evaluacion = 1 } = req.body

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

    // Hash del archivo REAL almacenado
    const fileBuffer = await fs.readFile(filePath)
    const hash = sha256(fileBuffer)

    const timestampCaptura = new Date()
    await pool.query(
      `
      INSERT INTO EvidenciaAntifraude (
        id_evaluacion,
        tipo_evidencia,
        uri_almacenamiento,
        hash_sha256,
        algoritmo_cifrado,
        timestamp_captura,
        fecha_retencion_hasta,
        inmutable,
        creado_en
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1,
        "captura",
        filePath,
        hash,
        "HASH_SHA256",
        timestampCaptura,
        fechaRetencion(),
        1,
        new Date()
      ]
    )
    console.log("📸 screenshot guardado + BD")

    res.json({
      ok: true,
      file: fileName
    })

  } catch (err) {
    console.error("❌ screenshot error:", err)
    res.status(500).json({ error: err.message })
  }
}

/* =========================
   ⌨️ KEYSTROKES
========================= */
exports.saveKeystrokes = async (req, res) => {
  try {
    const { logs, id_evaluacion = 1 } = req.body

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: "logs inválidos" })
    }

    await fs.ensureDir(KEYSTROKES_DIR)

    const fileName = `keys-${Date.now()}.json`
    const filePath = path.join(KEYSTROKES_DIR, fileName)

    const content = JSON.stringify(logs, null, 2)

    await fs.writeFile(filePath, content)

    // Hash del archivo REAL almacenado
    const fileBuffer = await fs.readFile(filePath)
    const hash = sha256(fileBuffer)

    const timestampCaptura = new Date()

    await pool.query(
      `
      INSERT INTO EvidenciaAntifraude (
        id_evaluacion,
        tipo_evidencia,
        uri_almacenamiento,
        hash_sha256,
        algoritmo_cifrado,
        timestamp_captura,
        fecha_retencion_hasta,
        inmutable,
        creado_en
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1,
        "log_tecleo",
        filePath,
        hash,
        "HASH_SHA256",
        timestampCaptura,
        fechaRetencion(),
        1,
        new Date()
      ]
    )

    console.log("⌨️ keystrokes guardados + BD")

    res.json({
      ok: true,
      file: fileName
    })

  } catch (err) {
    console.error("❌ keystrokes error:", err)
    res.status(500).json({ error: err.message })
  }
}

/* =========================
   🎥 VIDEO
========================= */
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

exports.saveVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "video vacío" })
    }

    await fs.ensureDir(VIDEOS_DIR)

    const filePath = path.join(VIDEOS_DIR, req.file.filename)

    // Hash del archivo REAL almacenado
    const fileBuffer = await fs.readFile(filePath)
    const hash = sha256(fileBuffer)

    const timestampCaptura = new Date()

    await pool.query(
      `
      INSERT INTO EvidenciaAntifraude (
        id_evaluacion,
        tipo_evidencia,
        uri_almacenamiento,
        hash_sha256,
        algoritmo_cifrado,
        timestamp_captura,
        fecha_retencion_hasta,
        inmutable,
        creado_en
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1,
        "video",
        filePath,
        hash,
        "HASH_SHA256",
        timestampCaptura,
        fechaRetencion(),
        1,
        new Date()
      ]
    )

    console.log("🎥 video guardado + BD")

    res.json({
      ok: true,
      file: req.file.filename
    })

  } catch (err) {
    console.error("❌ video error:", err)
    res.status(500).json({ error: err.message })
  }
}