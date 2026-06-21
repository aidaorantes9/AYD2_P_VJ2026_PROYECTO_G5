import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'

const API_BASE =
  import.meta.env.VITE_ANTIFRAUDE_API_URL ||
  'http://localhost:4004'

const INTERVALO_CAPTURA_MS = 2 * 60 * 1000
const INTERVALO_LOGS_MS = 15 * 1000
const DURACION_VIDEO_INICIAL_MS = 5000

export default function MonitoreoAntifraude({
  idEvaluacion,
  onEstadoChange,
}) {
  const [estado, setEstado] = useState('pendiente')

  const [mensaje, setMensaje] = useState(
    'Debe activar el monitoreo antes de responder.'
  )

  const [capturas, setCapturas] = useState(0)
  const [logsEnviados, setLogsEnviados] = useState(0)
  const [videoGuardado, setVideoGuardado] =
    useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const logsRef = useRef([])
  const intervaloCapturaRef = useRef(null)
  const intervaloLogsRef = useRef(null)
  const grabadorRef = useRef(null)
  const desmontadoRef = useRef(false)

  /*
   * Informa al componente Examen cada vez
   * que cambia el estado del monitoreo.
   */
  useEffect(() => {
    onEstadoChange?.(estado)
  }, [estado, onEstadoChange])

  async function leerRespuesta(respuesta) {
    const datos = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        datos.error ||
          datos.message ||
          'No fue posible almacenar la evidencia'
      )
    }

    return datos
  }

  const enviarLogs = useCallback(
    async ({ keepalive = false } = {}) => {
      if (
        !idEvaluacion ||
        logsRef.current.length === 0
      ) {
        return
      }

      const lote = logsRef.current.splice(
        0,
        logsRef.current.length
      )

      try {
        const respuesta = await fetch(
          `${API_BASE}/api/exam/keystrokes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_evaluacion: idEvaluacion,
              logs: lote,
            }),
            keepalive,
          }
        )

        await leerRespuesta(respuesta)

        if (!desmontadoRef.current) {
          setLogsEnviados(
            (cantidad) => cantidad + lote.length
          )
        }
      } catch (error) {
        /*
         * Si el envío normal falla, regresamos
         * los eventos a la cola para reintentarlos.
         */
        if (!keepalive) {
          logsRef.current.unshift(...lote)

          if (!desmontadoRef.current) {
            setMensaje(error.message)
          }
        }
      }
    },
    [idEvaluacion]
  )

  const capturarPantalla = useCallback(async () => {
    const video = videoRef.current

    if (
      !idEvaluacion ||
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return
    }

    try {
      const canvas =
        document.createElement('canvas')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const contexto = canvas.getContext('2d')

      contexto.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const image = canvas.toDataURL(
        'image/png',
        0.85
      )

      const respuesta = await fetch(
        `${API_BASE}/api/exam/screenshots`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_evaluacion: idEvaluacion,
            image,
          }),
        }
      )

      await leerRespuesta(respuesta)

      if (!desmontadoRef.current) {
        setCapturas(
          (cantidad) => cantidad + 1
        )
      }
    } catch (error) {
      if (!desmontadoRef.current) {
        setMensaje(error.message)
      }
    }
  }, [idEvaluacion])

  const grabarVideoInicial = useCallback(
    async (stream) => {
      if (
        !idEvaluacion ||
        typeof MediaRecorder === 'undefined'
      ) {
        return
      }

      try {
        const opciones = {}

        if (
          MediaRecorder.isTypeSupported(
            'video/webm;codecs=vp8'
          )
        ) {
          opciones.mimeType =
            'video/webm;codecs=vp8'
        }

        const fragmentos = []

        const grabador = new MediaRecorder(
          stream,
          opciones
        )

        grabadorRef.current = grabador

        grabador.ondataavailable = (evento) => {
          if (
            evento.data &&
            evento.data.size > 0
          ) {
            fragmentos.push(evento.data)
          }
        }

        grabador.onstop = async () => {
          if (fragmentos.length === 0) {
            return
          }

          try {
            const video = new Blob(
              fragmentos,
              {
                type:
                  grabador.mimeType ||
                  'video/webm',
              }
            )

            const formulario = new FormData()

            formulario.append(
              'id_evaluacion',
              String(idEvaluacion)
            )

            formulario.append(
              'video',
              video,
              `video-inicial-${idEvaluacion}.webm`
            )

            const respuesta = await fetch(
              `${API_BASE}/api/exam/video-inicial`,
              {
                method: 'POST',
                body: formulario,
              }
            )

            await leerRespuesta(respuesta)

            if (!desmontadoRef.current) {
              setVideoGuardado(true)
            }
          } catch (error) {
            if (!desmontadoRef.current) {
              setMensaje(error.message)
            }
          }
        }

        grabador.start()

        window.setTimeout(() => {
          if (
            grabador.state === 'recording'
          ) {
            grabador.stop()
          }
        }, DURACION_VIDEO_INICIAL_MS)
      } catch (error) {
        if (!desmontadoRef.current) {
          setMensaje(
            'El navegador no permitió guardar el video inicial.'
          )
        }
      }
    },
    [idEvaluacion]
  )

  const detenerRecursos = useCallback(() => {
    if (intervaloCapturaRef.current) {
      clearInterval(
        intervaloCapturaRef.current
      )

      intervaloCapturaRef.current = null
    }

    if (intervaloLogsRef.current) {
      clearInterval(
        intervaloLogsRef.current
      )

      intervaloLogsRef.current = null
    }

    if (
      grabadorRef.current &&
      grabadorRef.current.state ===
        'recording'
    ) {
      grabadorRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }
  }, [])

  const detenerMonitoreo =
    useCallback(async () => {
      await enviarLogs()
      detenerRecursos()

      if (!desmontadoRef.current) {
        setEstado('detenido')

        setMensaje(
          'El monitoreo fue detenido. Debe activarlo nuevamente para continuar.'
        )
      }
    }, [detenerRecursos, enviarLogs])

  async function activarMonitoreo() {
    if (!idEvaluacion) {
      setMensaje(
        'La evaluación todavía no está disponible.'
      )
      return
    }

    if (
      !navigator.mediaDevices
        ?.getDisplayMedia
    ) {
      setEstado('error')

      setMensaje(
        'El navegador no permite compartir pantalla.'
      )
      return
    }

    setEstado('activando')

    setMensaje(
      'Solicitando autorización para compartir pantalla...'
    )

    try {
      const stream =
        await navigator.mediaDevices
          .getDisplayMedia({
            video: {
              frameRate: 1,
            },
            audio: false,
          })

      streamRef.current = stream

      const video = videoRef.current

      video.srcObject = stream
      video.muted = true

      await video.play()

      const track =
        stream.getVideoTracks()[0]

      /*
       * También se ejecuta cuando el candidato
       * pulsa "Dejar de compartir".
       */
      track.onended = () => {
        if (!desmontadoRef.current) {
          void detenerMonitoreo()
        }
      }

      setEstado('activo')

      setMensaje(
        'Monitoreo activo. Ya puede responder la evaluación.'
      )

      /*
       * Captura inicial.
       */
      window.setTimeout(() => {
        void capturarPantalla()
      }, 1000)

      /*
       * Captura periódica cada dos minutos.
       */
      intervaloCapturaRef.current =
        window.setInterval(() => {
          void capturarPantalla()
        }, INTERVALO_CAPTURA_MS)

      /*
       * Envío de logs cada quince segundos.
       */
      intervaloLogsRef.current =
        window.setInterval(() => {
          void enviarLogs()
        }, INTERVALO_LOGS_MS)

      /*
       * Video inicial de cinco segundos.
       */
      void grabarVideoInicial(stream)
    } catch (error) {
      setEstado('error')

      setMensaje(
        error.name === 'NotAllowedError'
          ? 'No se autorizó compartir la pantalla. El examen permanece bloqueado.'
          : error.message
      )
    }
  }

  /*
   * Registra únicamente metadatos técnicos.
   * No almacena el texto escrito.
   */
  useEffect(() => {
    if (estado !== 'activo') {
      return undefined
    }

    function registrarEvento(evento) {
      logsRef.current.push({
        tipo: 'keydown',
        codigo: evento.code,
        fecha: new Date().toISOString(),
        ctrl: evento.ctrlKey,
        alt: evento.altKey,
        shift: evento.shiftKey,
        meta: evento.metaKey,
      })
    }

    window.addEventListener(
      'keydown',
      registrarEvento
    )

    return () => {
      window.removeEventListener(
        'keydown',
        registrarEvento
      )
    }
  }, [estado])

  /*
   * Limpieza cuando se abandona la vista.
   */
  useEffect(() => {
    desmontadoRef.current = false

    return () => {
      desmontadoRef.current = true

      void enviarLogs({
        keepalive: true,
      })

      detenerRecursos()
    }
  }, [detenerRecursos, enviarLogs])

  const colorEstado = {
    pendiente: 'warning',
    activando: 'info',
    activo: 'success',
    detenido: 'danger',
    error: 'danger',
  }[estado]

  const puedeActivar =
    estado === 'pendiente' ||
    estado === 'detenido' ||
    estado === 'error'

  return (
    <CCard
      style={{
        minWidth: '270px',
        maxWidth: '270px',
      }}
    >
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            Monitoreo de integridad
          </h6>

          <CBadge color={colorEstado}>
            {estado}
          </CBadge>
        </div>

        <CAlert
          color={
            estado === 'error' ||
            estado === 'detenido'
              ? 'danger'
              : estado === 'activo'
                ? 'success'
                : 'warning'
          }
          className="small"
        >
          {mensaje}
        </CAlert>

        <div className="small mb-2">
          <strong>Evaluación:</strong>{' '}
          {idEvaluacion || 'Pendiente'}
        </div>

        <div className="small mb-2">
          <strong>Capturas:</strong>{' '}
          {capturas}
        </div>

        <div className="small mb-2">
          <strong>
            Eventos de teclado:
          </strong>{' '}
          {logsEnviados}
        </div>

        <div className="small mb-3">
          <strong>Video inicial:</strong>{' '}
          {videoGuardado
            ? 'Almacenado'
            : 'Pendiente'}
        </div>

        {puedeActivar && (
          <CButton
            color="primary"
            className="w-100"
            onClick={activarMonitoreo}
            disabled={!idEvaluacion}
          >
            {estado === 'detenido'
              ? 'Reactivar monitoreo'
              : 'Activar monitoreo'}
          </CButton>
        )}

        {estado === 'activando' && (
          <CButton
            color="primary"
            className="w-100"
            disabled
          >
            <CSpinner
              size="sm"
              className="me-2"
            />
            Activando...
          </CButton>
        )}

        {estado === 'activo' && (
          <CButton
            color="secondary"
            variant="outline"
            className="w-100"
            onClick={detenerMonitoreo}
          >
            Detener monitoreo
          </CButton>
        )}

        <p className="small text-muted mt-3 mb-0">
          Se registran evidencias técnicas.
          No se almacena el texto escrito.
        </p>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            position: 'fixed',
            left: '-10000px',
            width: '1px',
            height: '1px',
          }}
        />
      </CCardBody>
    </CCard>
  )
}
