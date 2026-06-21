import { createContext, useContext, useEffect, useRef, useState } from "react"

const ScreenStreamContext = createContext(null)

export function useScreenStream() {
  return useContext(ScreenStreamContext)
}

export default function ScreenStreamProvider({ children }) {

  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {

    const init = async () => {

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      streamRef.current = stream
      setReady(true)
    }

    init()

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }

  }, [])

  return (
    <ScreenStreamContext.Provider value={{
      stream: streamRef.current,
      ready
    }}>
      {children}
    </ScreenStreamContext.Provider>
  )
}