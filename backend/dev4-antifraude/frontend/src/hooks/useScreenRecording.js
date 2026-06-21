import { useEffect } from "react"
import { useScreenStream } from "../components/ScreenStreamProvider"

export default function useScreenRecording(onComplete) {

  const { stream, ready } = useScreenStream()

  useEffect(() => {

    if (!ready || !stream) return

    const recorder = new MediaRecorder(stream)
    const chunks = []

    recorder.ondataavailable = (e) => chunks.push(e.data)

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      onComplete(blob)
    }

    recorder.start()

    const timeout = setTimeout(() => {
      recorder.stop()
    }, 5000)

    return () => clearTimeout(timeout)

  }, [ready, stream])
}