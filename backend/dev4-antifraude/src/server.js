const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: "50mb" }))

// 📦 ROUTES
const examRoutes = require("./routes/exam.routes")
const metricasRoutes = require("./routes/metricas.routes")

// 🔗 PREFIXES (IMPORTANTE PARA EVITAR CONFLICTOS)
app.use("/api/exam", examRoutes)
app.use("/api/metricas", metricasRoutes)

// 🚀 PORT UNICO
const PORT = process.env.PORT || 4004

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`)
})