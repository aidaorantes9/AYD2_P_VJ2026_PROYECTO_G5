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
  numeroPregunta = 1,
  onEstadoChange,
}) {
  const [estado, setEstado] = useState('pendiente')

  const [mensaje, setMensaje] = useState(
    'Debe activar el monitoreo antes de responder.'
  )

  const [capturas, setCapturas] = useState(0)
  const [logsEnviados, setLogsEnviados] = useState(0)
  const [videoGuardado, setVideoGuardado] = useState(false)
  const [detecciones, setDetecciones] = useState(0)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const logsRef = useRef([])
  const intervaloCapturaRef = useRef(null)
  const intervaloLogsRef = useRef(null)
  const grabadorRef = useRef(null)
  const desmontadoRef = useRef(false)

  const ultimaEvidenciaRef = useRef(null)
  const indiciosRegistradosRef = useRef(new Set())

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

  const crearEvidenciaTecnica = useCallback(
    async ({ tipoIndicio, descripcion }) => {
      if (!idEvaluacion) {
        return null
      }

      const respuesta = await fetch(
        `${API_BASE}/api/exam/keystrokes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_evaluacion: idEvaluacion,
            logs: [
              {
                tipo: 'indicio_frontend',
                codigo: tipoIndicio,
                fecha: new Date().toISOString(),
                detalle: descripcion,
              },
            ],
          }),
        }
      )

      const datos = await leerRespuesta(respuesta)

      ultimaEvidenciaRef.current = datos.id_evidencia

      if (!desmontadoRef.current) {
        setLogsEnviados((cantidad) => cantidad + 1)
      }

      return datos.id_evidencia
    },
    [idEvaluacion]
  )

  const registrarDeteccionFraude = useCallback(
    async ({
      tipoIndicio,
      descripcion,
      severidad = 'media',
      idEvidencia = null,
    }) => {
      if (!idEvaluacion || !tipoIndicio) {
        return
      }

      const claveIndicio = `${idEvaluacion}-${numeroPregunta}-${tipoIndicio}-${idEvidencia || 'sin-evidencia'}`

      if (indiciosRegistradosRef.current.has(claveIndicio)) {
        return
      }

      indiciosRegistradosRef.current.add(claveIndicio)

      try {
        const evidencia =
          idEvidencia ||
          ultimaEvidenciaRef.current ||
          (await crearEvidenciaTecnica({
            tipoIndicio,
            descripcion,
          }))

        if (!evidencia) {
          throw new Error(
            'No existe evidencia técnica para asociar la detección.'
          )
        }

        const respuesta = await fetch(
          `${API_BASE}/api/exam/detecciones`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_evaluacion: idEvaluacion,
              id_evidencia: evidencia,
              tipo_indicio: tipoIndicio,
              descripcion,
              severidad,
            }),
          }
        )

        const datos = await leerRespuesta(respuesta)

        if (!desmontadoRef.current) {
          setDetecciones((cantidad) => cantidad + 1)

          setMensaje(
            datos?.notificacion?.enviada
              ? 'Anomalía detectada. Se notificó al auditor del SICA.'
              : 'Anomalía detectada. La detección fue registrada, pero no se pudo enviar el correo.'
          )
        }
      } catch (error) {
        indiciosRegistradosRef.current.delete(claveIndicio)

        if (!desmontadoRef.current) {
          setMensaje(error.message)
        }
      }
    },
    [crearEvidenciaTecnica, idEvaluacion, numeroPregunta]
  )

  const enviarLogs = useCallback(
    async ({ keepalive = false } = {}) => {
      if (!idEvaluacion || logsRef.current.length === 0) {
        return
      }

      const lote = logsRef.current.splice(0, logsRef.current.length)

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

        const datos = await leerRespuesta(respuesta)

        ultimaEvidenciaRef.current = datos.id_evidencia

        if (!desmontadoRef.current) {
          setLogsEnviados((cantidad) => cantidad + lote.length)
        }
      } catch (error) {
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
      return null
    }

    try {
      const canvas = document.createElement('canvas')

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

      const image = canvas.toDataURL('image/png', 0.85)

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

      const datos = await leerRespuesta(respuesta)

      ultimaEvidenciaRef.current = datos.id_evidencia

      if (!desmontadoRef.current) {
        setCapturas((cantidad) => cantidad + 1)
      }

      return datos
    } catch (error) {
      if (!desmontadoRef.current) {
        setMensaje(error.message)
      }

      return null
    }
  }, [idEvaluacion])

  const grabarVideoInicial = useCallback(
    async (stream) => {
      if (!idEvaluacion || typeof MediaRecorder === 'undefined') {
        return
      }

      try {
        const opciones = {}

        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          opciones.mimeType = 'video/webm;codecs=vp8'
        }

        const fragmentos = []

        const grabador = new MediaRecorder(stream, opciones)

        grabadorRef.current = grabador

        grabador.ondataavailable = (evento) => {
          if (evento.data && evento.data.size > 0) {
            fragmentos.push(evento.data)
          }
        }

        grabador.onstop = async () => {
          if (fragmentos.length === 0) {
            return
          }

          try {
            const video = new Blob(fragmentos, {
              type: grabador.mimeType || 'video/webm',
            })

            const formulario = new FormData()

            formulario.append('id_evaluacion', String(idEvaluacion))

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

            const datos = await leerRespuesta(respuesta)

            ultimaEvidenciaRef.current = datos.id_evidencia

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
          if (grabador.state === 'recording') {
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
      clearInterval(intervaloCapturaRef.current)
      intervaloCapturaRef.current = null
    }

    if (intervaloLogsRef.current) {
      clearInterval(intervaloLogsRef.current)
      intervaloLogsRef.current = null
    }

    if (
      grabadorRef.current &&
      grabadorRef.current.state === 'recording'
    ) {
      grabadorRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const detenerMonitoreo = useCallback(async () => {
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
      setMensaje('La evaluación todavía no está disponible.')
      return
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setEstado('error')

      setMensaje('El navegador no permite compartir pantalla.')
      return
    }

    setEstado('activando')

    setMensaje('Solicitando autorización para compartir pantalla...')

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
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

      const track = stream.getVideoTracks()[0]

      track.onended = () => {
        if (!desmontadoRef.current) {
          void registrarDeteccionFraude({
            tipoIndicio: 'interrupcion_monitoreo',
            descripcion:
              'El candidato detuvo la compartición de pantalla durante la evaluación.',
            severidad: 'alta',
          })

          void detenerMonitoreo()
        }
      }

      setEstado('activo')

      setMensaje(
        'Monitoreo activo. Ya puede responder la evaluación.'
      )

      window.setTimeout(() => {
        void capturarPantalla()
      }, 1000)

      intervaloCapturaRef.current = window.setInterval(() => {
        void capturarPantalla()
      }, INTERVALO_CAPTURA_MS)

      intervaloLogsRef.current = window.setInterval(() => {
        void enviarLogs()
      }, INTERVALO_LOGS_MS)

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

      const usaControl = evento.ctrlKey || evento.metaKey

      const atajoSospechoso =
        (usaControl &&
          ['KeyC', 'KeyV', 'KeyX', 'KeyP', 'KeyS'].includes(
            evento.code
          )) ||
        (evento.altKey && evento.code === 'Tab')

      if (atajoSospechoso) {
        void registrarDeteccionFraude({
          tipoIndicio: `atajo_teclado_sospechoso_${evento.code}`,
          descripcion: `El candidato utilizó una combinación de teclas restringida: ${evento.code}.`,
          severidad: 'media',
        })
      }
    }

    window.addEventListener('keydown', registrarEvento)

    return () => {
      window.removeEventListener('keydown', registrarEvento)
    }
  }, [estado, registrarDeteccionFraude])

  useEffect(() => {
    if (estado !== 'activo') {
      return undefined
    }

    function detectarCambioDePestana() {
      if (document.hidden) {
        void registrarDeteccionFraude({
          tipoIndicio: 'cambio_pestana_examen',
          descripcion:
            'El candidato cambió de pestaña o minimizó la ventana durante la evaluación.',
          severidad: 'media',
        })
      }
    }

    function detectarPerdidaDeFoco() {
      void registrarDeteccionFraude({
        tipoIndicio: 'perdida_foco_examen',
        descripcion:
          'La ventana del examen perdió el foco durante la evaluación.',
        severidad: 'media',
      })
    }

    document.addEventListener('visibilitychange', detectarCambioDePestana)
    window.addEventListener('blur', detectarPerdidaDeFoco)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        detectarCambioDePestana
      )

      window.removeEventListener('blur', detectarPerdidaDeFoco)
    }
  }, [estado, registrarDeteccionFraude])

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
    <CCard>
      <CCardBody>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h6 className="mb-0">Monitoreo de integridad</h6>
          <CBadge color={colorEstado}>{estado}</CBadge>
        </div>

        <CAlert
          color={
            estado === 'error' || estado === 'detenido'
              ? 'danger'
              : estado === 'activo'
                ? 'success'
                : 'warning'
          }
          className="small"
        >
          {mensaje}
        </CAlert>

        <div className="d-flex flex-wrap gap-2 mb-2 small">
          <div>
            <strong>Evaluación:</strong> {idEvaluacion || 'Pendiente'}
          </div>

          <div>
            <strong>Capturas:</strong> {capturas}
          </div>

          <div>
            <strong>Eventos de teclado:</strong> {logsEnviados}
          </div>

          <div>
            <strong>Video inicial:</strong>{' '}
            {videoGuardado ? 'Almacenado' : 'Pendiente'}
          </div>

          <div>
            <strong>Detecciones:</strong> {detecciones}
          </div>
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
          <CButton color="primary" className="w-100" disabled>
            <CSpinner size="sm" className="me-2" />
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
          Se registran evidencias técnicas. No se almacena el texto escrito.
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