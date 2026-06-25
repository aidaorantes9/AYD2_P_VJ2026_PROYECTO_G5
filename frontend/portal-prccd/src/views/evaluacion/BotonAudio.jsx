import { useState, useRef, useEffect } from 'react'
import { CButton, CSpinner, CAlert } from '@coreui/react'

const DURACION_GRABACION_MS = 5000

// Icono SVG de micrófono
const MicIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

// Icono de stop (cuadrado relleno)
const StopIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
)

export default function BotonAudio({
  idCandidato,
  idEvaluacion,
  idPregunta,
  apiBase,
  onResultado,
  disabled,
}) {
  const [estado, setEstado] = useState('inactivo')
  const [countdown, setCountdown] = useState(null)
  const [textoMostrado, setTextoMostrado] = useState('')
  const [errorMostrado, setErrorMostrado] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const countdownRef = useRef(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const iniciarGrabacion = async () => {
    setTextoMostrado('')
    setErrorMostrado('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await enviarAudio(blob)
      }

      mediaRecorder.start()
      setEstado('grabando')

      let segundos = DURACION_GRABACION_MS / 1000
      setCountdown(segundos)

      countdownRef.current = setInterval(() => {
        segundos -= 1
        setCountdown(segundos)

        if (segundos <= 0) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
          setEstado('procesando')
          setCountdown(null)
        }
      }, 1000)
    } catch {
      setErrorMostrado('No se pudo acceder al micrófono. Verifica los permisos.')
      setEstado('error')
    }
  }

  const enviarAudio = async (blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'respuesta.webm')
      formData.append('id_candidato', idCandidato)
      formData.append('id_evaluacion', idEvaluacion)
      formData.append('id_pregunta', idPregunta)

      const response = await fetch(
        `${apiBase}/api/evaluacion/respuesta-audio`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el audio')
      }

      const resultado = data.resultado
      const textoTranscrito =
        resultado?.speech_to_text?.texto_transcrito || ''

      if (resultado?.opcion_detectada) {
        setTextoMostrado(`"${resultado.opcion_detectada.texto_opcion}"`)
      } else if (textoTranscrito) {
        setTextoMostrado(`"${textoTranscrito}"`)
      } else {
        setTextoMostrado('No se detectó texto. Intenta de nuevo.')
      }

      setEstado('listo')
      onResultado?.(resultado)
    } catch (err) {
      setErrorMostrado(err.message || 'No se pudo procesar el audio')
      setEstado('error')
    }
  }

  const puedeGrabar =
    !disabled &&
    estado !== 'grabando' &&
    estado !== 'procesando'

  // Determinar color, icono y etiqueta según estado
  let buttonColor = 'secondary'
  let iconComponent = <MicIcon color="#fff" />
  let label = 'Usar voz'

  if (estado === 'grabando') {
    buttonColor = 'danger'
    iconComponent = <StopIcon color="#fff" />
    label = `${countdown}s`
  } else if (estado === 'procesando') {
    buttonColor = 'primary'
    iconComponent = <CSpinner size="sm" color="light" />
    label = 'Procesando'
  } else if (estado === 'listo') {
    buttonColor = 'success'
    iconComponent = <MicIcon color="#fff" />
    label = 'Grabar de nuevo'
  } else if (estado === 'error') {
    buttonColor = 'danger'
    iconComponent = <MicIcon color="#fff" />
    label = 'Error'
  }

  return (
    <div className="d-flex align-items-stretch gap-2 my-3">
      {/* Columna del botón (25%) */}
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ flex: '0 0 25%' }}
      >
        <CButton
          color={buttonColor}
          onClick={puedeGrabar ? iniciarGrabacion : undefined}
          disabled={!puedeGrabar}
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 52,
            height: 52,
            borderRadius: '4px',
            fontSize: 22,
          }}
          title={estado === 'grabando' ? 'Grabando...' : 'Grabar respuesta de voz'}
        >
          {iconComponent}
        </CButton>
        <small className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
          {label}
        </small>
      </div>

      {/* Panel de texto (75%) */}
      <div className="d-flex align-items-center" style={{ flex: '1 1 75%' }}>
        {estado === 'inactivo' && (
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Presiona el micrófono para responder con voz. Grabación de 5 segundos.
          </span>
        )}

        {estado === 'grabando' && (
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle bg-danger d-inline-block"
              style={{ width: 10, height: 10, animation: 'pulse 1s infinite' }}
            />
            <span className="text-danger fw-bold" style={{ fontSize: '0.85rem' }}>
              Grabando... habla ahora
            </span>
          </div>
        )}

        {estado === 'procesando' && (
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Procesando audio...
          </span>
        )}

        {estado === 'listo' && textoMostrado && (
          <CAlert
            color="info"
            className="mb-0 py-2 px-3 w-100"
            style={{ fontSize: '0.85rem' }}
          >
            <span className="fw-bold">Escuché: </span>
            {textoMostrado}
          </CAlert>
        )}

        {estado === 'error' && errorMostrado && (
          <CAlert
            color="danger"
            className="mb-0 py-2 px-3 w-100"
            style={{ fontSize: '0.85rem' }}
          >
            {errorMostrado}
          </CAlert>
        )}
      </div>
    </div>
  )
}