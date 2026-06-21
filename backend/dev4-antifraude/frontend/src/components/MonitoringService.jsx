import useScreenRecording from "../hooks/useScreenRecording"
import useScreenCapture from "../hooks/useScreenCapture"
import useKeystrokeLogger from "../hooks/useKeystrokeLogger"
import { API_URL } from "../config/api"

export default function MonitoringService() {

  console.log("🔥 MonitoringService montado")

  // 🎥 VIDEO INICIAL
  useScreenRecording(async (videoBlob) => {
    try {
      console.log("🎥 enviando video inicial...")

      const formData = new FormData()
      formData.append("video", videoBlob, "inicio.webm")

      const res = await fetch(`${API_URL}/api/exam/video-inicial`, {
        method: "POST",
        body: formData
      })

      console.log("🎥 video status:", res.status)

    } catch (err) {
      console.error("❌ error video:", err)
    }
  })


  // 📸 SCREENSHOTS
  useScreenCapture(async (image) => {
    try {
      console.log("📸 enviando screenshot...")

      if (!image) {
        console.warn("⚠️ screenshot vacío")
        return
      }

      const res = await fetch(`${API_URL}/api/exam/screenshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      })

      console.log("📸 screenshot status:", res.status)

    } catch (err) {
      console.error("❌ error screenshot:", err)
    }
  })


  // ⌨️ KEYSTROKES
  useKeystrokeLogger(async (logs) => {
    try {
      console.log("⌨️ enviando keystrokes...")

      if (!logs) {
        console.warn("⚠️ logs vacíos")
        return
      }

      const res = await fetch(`${API_URL}/api/exam/keystrokes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      })

      console.log("⌨️ keystrokes status:", res.status)

    } catch (err) {
      console.error("❌ error keystrokes:", err)
    }
  })

  return null
}