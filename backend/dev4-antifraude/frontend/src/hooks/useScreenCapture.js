import { useEffect } from "react"
import { useScreenStream } from "../components/ScreenStreamProvider"

export default function useScreenCapture(onCapture) {
  console.log("📸 screenshot hook activo")
  const { stream, ready } = useScreenStream()

  useEffect(() => {

    if (!ready || !stream) return

    const video = document.createElement("video")
    video.srcObject = stream
    video.play()

    const interval = setInterval(() => {

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0)

      const image = canvas.toDataURL("image/png")

      onCapture(image)

    }, 30000)

    return () => clearInterval(interval)

  }, [ready, stream])
}