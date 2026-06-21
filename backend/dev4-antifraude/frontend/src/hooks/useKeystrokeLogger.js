import { useEffect } from "react"

export default function useKeystrokeLogger(onLog) {
  console.log("⌨️ keystroke hook activo")

  useEffect(() => {

    let buffer = []

    const handler = (e) => {
      buffer.push({
        key: e.key,
        time: new Date().toISOString()
      })
    }

    window.addEventListener("keydown", handler)

    const interval = setInterval(() => {
      if (buffer.length > 0) {
        onLog([...buffer])
        buffer = []
      }
    }, 40000)

    return () => {
      window.removeEventListener("keydown", handler)
      clearInterval(interval)
    }

  }, [onLog])
}