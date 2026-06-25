import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormCheck,
  CProgress,
  CSpinner,
} from '@coreui/react'

import MonitoreoAntifraude from '../views/antifraude/MonitoreoAntifraude'

const API_BASE =
  import.meta.env.VITE_EVALUACIONES_API_URL ||
  'http://localhost:4001'

const CERTIFICACION_API_BASE =
  import.meta.env.VITE_CERTIFICACION_API_URL ||
  'http://localhost:4003'

const TOTAL_PREGUNTAS = 10
// DEJO CONSTANCIA DE QUE ESTO ES LO QUE SE ESTA ELIMINANDO ACTUALMENTE DEL CODIGO PARA QUE AHORA SEA EL USUARIO EL QUE REALMENTE ESTA TRABAJANDO Y NO UNO QUEMADO QUE ERA ANA LOPEZ PREVIAMENTE 
// const ID_CANDIDATO = 1
const TIEMPO_TOTAL_SEG = 30 * 60

function obtenerSesionActual() {
  try {
    return JSON.parse(sessionStorage.getItem('sesion'))
  } catch {
    return null
  }
}

export default function Examen() {
  const navigate = useNavigate()

  const sesion = obtenerSesionActual()

  const ID_CANDIDATO = Number(sesion?.idCandidato)
  const NOMBRE_CANDIDATO = sesion?.nombre || 'Candidato'
  const UNIVERSIDAD_CANDIDATO = sesion?.universidad || 'Universidad no especificada'

  const [idEvaluacion, setIdEvaluacion] =
    useState(null)

  const [pregunta, setPregunta] =
    useState(null)

  const [numeroPregunta, setNumeroPregunta] =
    useState(1)

  const [
    opcionSeleccionada,
    setOpcionSeleccionada,
  ] = useState(null)

  const [resultado, setResultado] =
    useState(null)

  const [terminado, setTerminado] =
    useState(false)

  const [cargando, setCargando] =
    useState(true)

  const [enviando, setEnviando] =
    useState(false)

  const [grabandoVoz, setGrabandoVoz] =
    useState(false)

  const [procesandoVoz, setProcesandoVoz] =
    useState(false)

  const [textoTranscrito, setTextoTranscrito] =
    useState('')

  const [mensajeVoz, setMensajeVoz] =
    useState('')

  const [errorVoz, setErrorVoz] =
    useState('')

  const [
    emitiendoCertificado,
    setEmitiendoCertificado,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [
    tiempoRestante,
    setTiempoRestante,
  ] = useState(TIEMPO_TOTAL_SEG)

  /*
   * Estado recibido desde
   * MonitoreoAntifraude.
   */
  const [
    estadoMonitoreo,
    setEstadoMonitoreo,
  ] = useState('pendiente')

  /*
   * Permite saber si el monitoreo
   * ya fue activado al menos una vez.
   */
  const [
    monitoreoIniciado,
    setMonitoreoIniciado,
  ] = useState(false)

  const monitoreoActivo =
    estadoMonitoreo === 'activo'

  const tiempoInicioPregunta =
    useRef(Date.now())

  const finalizando = useRef(false)

  const grabadorVoz = useRef(null)

  const fragmentosAudio =
    useRef([])

  const flujoAudio =
    useRef(null)

  useEffect(() => {
    return () => {
      const grabador =
        grabadorVoz.current

      if (
        grabador &&
        grabador.state !== 'inactive'
      ) {
        grabador.ondataavailable = null
        grabador.onstop = null
        grabador.stop()
      }

      flujoAudio.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        )
    }
  }, [])

  const manejarEstadoMonitoreo =
    useCallback((nuevoEstado) => {
      setEstadoMonitoreo(nuevoEstado)

      if (nuevoEstado === 'activo') {
        setMonitoreoIniciado(true)
        setError('')
      }
    }, [])

  /*
   * Inicia la evaluación y obtiene
   * la primera pregunta.
   */
  useEffect(() => {
    async function iniciarEvaluacion() {
      try {
        setError('')

        // se valida esto, osea se tira el error en caso no lo jale va 
        if (!ID_CANDIDATO) {
          throw new Error('No se encontro un candidato valido en la sesión actual')
        }

        const respuesta = await fetch(
          `${API_BASE}/api/evaluacion/${ID_CANDIDATO}/iniciar`,
          {
            method: 'POST',
          }
        )

        const datos =
          await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.error ||
              'No se pudo iniciar la evaluación'
          )
        }

        setIdEvaluacion(
          datos.id_evaluacion
        )

        setPregunta(
          datos.pregunta
        )

        setNumeroPregunta(
          datos.numero_pregunta
        )

        tiempoInicioPregunta.current =
          Date.now()
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    iniciarEvaluacion()
  }, [])

  /*
   * Emite y verifica automáticamente
   * el certificado cuando se aprueba.
   */
  const emitirCertificadoAutomaticamente =
    useCallback(
      async (resultadoEvaluacion) => {
        if (
          !resultadoEvaluacion
            ?.id_evaluacion ||
          emitiendoCertificado
        ) {
          return false
        }

        setEmitiendoCertificado(true)
        setError('')

        try {
          const respuestaEmision =
            await fetch(
              `${CERTIFICACION_API_BASE}/api/certificados/emitir`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  id_candidato:
                    ID_CANDIDATO,

                  id_evaluacion:
                    resultadoEvaluacion
                      .id_evaluacion,

                  actor:
                    'Sistema PRCCD',

                  datos_certificado: {
                    nombre_candidato:
                      NOMBRE_CANDIDATO,

                    universidad:
                      UNIVERSIDAD_CANDIDATO,
                  },
                }),
              }
            )

          const datosEmision =
            await respuestaEmision.json()

          if (!respuestaEmision.ok) {
            throw new Error(
              datosEmision.error ||
                'No se pudo emitir el certificado'
            )
          }

          const codigo =
            datosEmision?.certificado
              ?.codigo_verificacion

          if (!codigo) {
            throw new Error(
              'La emisión no devolvió un código de verificación'
            )
          }

          const respuestaVerificacion =
            await fetch(
              `${CERTIFICACION_API_BASE}/api/auditoria/verificar/${encodeURIComponent(
                codigo
              )}`
            )

          const datosVerificacion =
            await respuestaVerificacion.json()

          if (
            !respuestaVerificacion.ok ||
            !datosVerificacion.valido
          ) {
            throw new Error(
              datosVerificacion.error ||
                datosVerificacion.mensaje ||
                'El certificado fue emitido, pero no pudo verificarse'
            )
          }

          navigate('/certificado', {
            replace: true,
            state: {
              resultado:
                datosVerificacion,
            },
          })

          return true
        } catch (err) {
          setError(
            err.message ||
              'No se pudo generar el certificado'
          )

          return false
        } finally {
          setEmitiendoCertificado(false)
        }
      },
      [
        navigate,
        emitiendoCertificado,
      ]
    )

  /*
   * Finalización manual o por tiempo.
   */
  const finalizarEvaluacion =
    useCallback(async () => {
      if (
        !idEvaluacion ||
        terminado ||
        finalizando.current
      ) {
        return
      }

      finalizando.current = true
      setEnviando(true)
      setError('')

      try {
        const respuesta = await fetch(
          `${API_BASE}/api/evaluacion/${ID_CANDIDATO}/finalizar`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              id_evaluacion:
                idEvaluacion,
            }),
          }
        )

        const datos =
          await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.error ||
              'No se pudo finalizar la evaluación'
          )
        }

        setResultado(datos)
        setTerminado(true)

        if (datos.aprobada) {
          await emitirCertificadoAutomaticamente(
            datos
          )
        }
      } catch (err) {
        setError(err.message)
        finalizando.current = false
      } finally {
        setEnviando(false)
      }
    }, [
      idEvaluacion,
      terminado,
      emitirCertificadoAutomaticamente,
    ])

  /*
   * El tiempo no comienza hasta que el
   * monitoreo se active por primera vez.
   *
   * Si luego se deja de compartir pantalla,
   * el examen se bloquea, pero el tiempo
   * continúa avanzando.
   */
  useEffect(() => {
    if (
      cargando ||
      terminado ||
      !idEvaluacion ||
      !monitoreoIniciado ||
      tiempoRestante <= 0
    ) {
      return undefined
    }

    const intervalo =
      window.setInterval(() => {
        setTiempoRestante(
          (anterior) =>
            Math.max(
              anterior - 1,
              0
            )
        )
      }, 1000)

    return () =>
      window.clearInterval(intervalo)
  }, [
    cargando,
    terminado,
    idEvaluacion,
    monitoreoIniciado,
    tiempoRestante,
  ])

  /*
   * Finaliza automáticamente al llegar
   * a cero.
   */
  useEffect(() => {
    if (
      tiempoRestante === 0 &&
      idEvaluacion &&
      !terminado &&
      monitoreoIniciado
    ) {
      void finalizarEvaluacion()
    }
  }, [
    tiempoRestante,
    idEvaluacion,
    terminado,
    monitoreoIniciado,
    finalizarEvaluacion,
  ])

  function formatearTiempo(segundos) {
    const minutos =
      Math.floor(segundos / 60)

    const segundosRestantes =
      segundos % 60

    return `${minutos}:${segundosRestantes
      .toString()
      .padStart(2, '0')}`
  }

  function obtenerTipoAudioCompatible() {
    if (
      typeof MediaRecorder ===
      'undefined'
    ) {
      return ''
    }

    const tipos = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ]

    if (
      typeof MediaRecorder
        .isTypeSupported !==
      'function'
    ) {
      return ''
    }

    return (
      tipos.find((tipo) =>
        MediaRecorder
          .isTypeSupported(tipo)
      ) || ''
    )
  }

  function obtenerExtensionAudio(tipo) {
    const valor =
      String(tipo || '')
        .toLowerCase()

    if (valor.includes('mp4')) {
      return 'm4a'
    }

    if (valor.includes('ogg')) {
      return 'ogg'
    }

    return 'webm'
  }

  async function procesarRespuestaVoz(
    audio
  ) {
    if (
      !idEvaluacion ||
      !pregunta?.id_pregunta
    ) {
      setErrorVoz(
        'No existe una pregunta activa para procesar.'
      )
      return
    }

    setProcesandoVoz(true)
    setErrorVoz('')
    setMensajeVoz('')
    setTextoTranscrito('')

    try {
      const tipoAudio =
        audio.type ||
        'audio/webm'

      const extension =
        obtenerExtensionAudio(
          tipoAudio
        )

      const formulario =
        new FormData()

      formulario.append(
        'audio',
        audio,
        `respuesta-voz.${extension}`
      )

      formulario.append(
        'id_candidato',
        String(ID_CANDIDATO)
      )

      formulario.append(
        'id_evaluacion',
        String(idEvaluacion)
      )

      formulario.append(
        'id_pregunta',
        String(
          pregunta.id_pregunta
        )
      )

      formulario.append(
        'idioma',
        navigator.language ||
          'es-GT'
      )

      const respuesta =
        await fetch(
          `${API_BASE}/api/evaluacion/respuesta-audio`,
          {
            method: 'POST',
            body: formulario,
          }
        )

      const datos =
        await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
          datos.detalle ||
          'No se pudo procesar el audio.'
        )
      }

      const transcripcion =
        datos?.resultado
          ?.speech_to_text
          ?.texto_transcrito || ''

      const opcionDetectada =
        datos?.resultado
          ?.opcion_detectada

      setTextoTranscrito(
        transcripcion
      )

      if (!opcionDetectada) {
        setOpcionSeleccionada(
          null
        )

        setErrorVoz(
          'No se identificó una opción. Intente decir “respuesta uno”, “respuesta dos” o el texto de la opción.'
        )

        return
      }

      setOpcionSeleccionada(
        Number(
          opcionDetectada
            .id_opcion
        )
      )

      setMensajeVoz(
        `Se detectó la opción ${opcionDetectada.numero_detectado || ''}: ${opcionDetectada.texto_opcion}. Revísela y presione Guardar y continuar.`
      )
    } catch (err) {
      setErrorVoz(
        err.message ||
        'No se pudo procesar la respuesta por voz.'
      )
    } finally {
      setProcesandoVoz(false)
    }
  }

  async function iniciarGrabacionVoz() {
    if (!monitoreoActivo) {
      setErrorVoz(
        'Debe activar el monitoreo antes de responder por voz.'
      )
      return
    }

    if (
      !navigator.mediaDevices
        ?.getUserMedia ||
      typeof MediaRecorder ===
        'undefined'
    ) {
      setErrorVoz(
        'El navegador no permite grabar audio.'
      )
      return
    }

    setErrorVoz('')
    setMensajeVoz('')
    setTextoTranscrito('')

    try {
      const flujo =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: true,
          })

      flujoAudio.current =
        flujo

      const tipoAudio =
        obtenerTipoAudioCompatible()

      const grabador =
        tipoAudio
          ? new MediaRecorder(
              flujo,
              {
                mimeType:
                  tipoAudio,
              }
            )
          : new MediaRecorder(
              flujo
            )

      grabadorVoz.current =
        grabador

      fragmentosAudio.current =
        []

      grabador.ondataavailable =
        (evento) => {
          if (
            evento.data &&
            evento.data.size > 0
          ) {
            fragmentosAudio
              .current
              .push(evento.data)
          }
        }

      grabador.onstop = () => {
        const tipoFinal =
          grabador.mimeType ||
          tipoAudio ||
          'audio/webm'

        const audio = new Blob(
          fragmentosAudio.current,
          {
            type: tipoFinal,
          }
        )

        flujo
          .getTracks()
          .forEach((track) =>
            track.stop()
          )

        flujoAudio.current =
          null

        setGrabandoVoz(false)

        if (audio.size === 0) {
          setErrorVoz(
            'La grabación no contiene audio.'
          )
          return
        }

        void procesarRespuestaVoz(
          audio
        )
      }

      grabador.onerror = () => {
        setGrabandoVoz(false)

        setErrorVoz(
          'Ocurrió un error durante la grabación.'
        )
      }

      grabador.start()

      setGrabandoVoz(true)
    } catch (err) {
      flujoAudio.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        )

      flujoAudio.current =
        null

      setGrabandoVoz(false)

      setErrorVoz(
        err.name ===
        'NotAllowedError'
          ? 'Debe autorizar el uso del micrófono.'
          : 'No fue posible iniciar el micrófono.'
      )
    }
  }

  function detenerGrabacionVoz() {
    const grabador =
      grabadorVoz.current

    if (
      grabador &&
      grabador.state ===
        'recording'
    ) {
      grabador.stop()
    }
  }

  /*
   * Registra una respuesta y obtiene
   * la siguiente pregunta adaptativa.
   */
  async function responderPregunta() {
    if (!monitoreoActivo) {
      setError(
        'Debe activar el monitoreo antes de responder la evaluación.'
      )
      return
    }

    if (
      !opcionSeleccionada ||
      !pregunta ||
      enviando
    ) {
      return
    }

    setEnviando(true)
    setError('')

    try {
      const tiempoRespuesta =
        Date.now() -
        tiempoInicioPregunta.current

      const respuesta = await fetch(
        `${API_BASE}/api/evaluacion/respuesta`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id_candidato:
              ID_CANDIDATO,

            id_evaluacion:
              idEvaluacion,

            id_pregunta:
              pregunta.id_pregunta,

            id_opcion_seleccionada:
              opcionSeleccionada,

            tiempo_respuesta_ms:
              tiempoRespuesta,
          }),
        }
      )

      const datos =
        await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            'No se pudo registrar la respuesta'
        )
      }

      if (datos.terminado) {
        const resultadoFinal =
          datos.resultado || datos

        setResultado(
          resultadoFinal
        )

        setTerminado(true)

        if (
          resultadoFinal.aprobada
        ) {
          await emitirCertificadoAutomaticamente(
            resultadoFinal
          )
        }

        return
      }

      setPregunta(
        datos.siguiente_pregunta
      )

      setNumeroPregunta(
        datos.numero_pregunta
      )

      setOpcionSeleccionada(null)
      setTextoTranscrito('')
      setMensajeVoz('')
      setErrorVoz('')

      tiempoInicioPregunta.current =
        Date.now()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const progreso =
    (numeroPregunta /
      TOTAL_PREGUNTAS) *
    100

  if (cargando) {
    return (
      <CCard className="m-4">
        <CCardBody className="text-center">
          <CSpinner />

          <p className="mt-2 mb-0">
            Iniciando examen adaptativo...
          </p>
        </CCardBody>
      </CCard>
    )
  }

  if (terminado && resultado) {
    return (
      <CCard className="m-4">
        <CCardBody>
          <h4>
            Resultado del examen
          </h4>

          <CBadge
            color={
              resultado.aprobada
                ? 'success'
                : 'danger'
            }
            className="mb-3"
          >
            {resultado.aprobada
              ? 'Aprobado'
              : 'Reprobado'}
          </CBadge>

          <p>
            Calificación:{' '}
            <strong>
              {Number(
                resultado.calificacion
              ).toFixed(2)}
            </strong>{' '}
            / 100
          </p>

          <p>
            Correctas:{' '}
            {resultado.correctas} de{' '}
            {resultado.total}
          </p>

          {resultado.respondidas !==
            undefined && (
            <p>
              Preguntas respondidas:{' '}
              {resultado.respondidas}
            </p>
          )}

          {emitiendoCertificado && (
            <CAlert color="info">
              <CSpinner
                size="sm"
                className="me-2"
              />
              Emitiendo y verificando
              su certificado...
            </CAlert>
          )}

          {error && (
            <CAlert color="danger">
              {error}
            </CAlert>
          )}

          {resultado.aprobada && (
            <CButton
              color="success"
              disabled={
                emitiendoCertificado
              }
              onClick={() =>
                emitirCertificadoAutomaticamente(
                  resultado
                )
              }
            >
              {emitiendoCertificado ? (
                <>
                  <CSpinner
                    size="sm"
                    className="me-2"
                  />
                  Generando certificado...
                </>
              ) : (
                'Obtener certificado'
              )}
            </CButton>
          )}
        </CCardBody>
      </CCard>
    )
  }

  if (error && !pregunta) {
    return (
      <CAlert
        color="danger"
        className="m-4"
      >
        {error}
      </CAlert>
    )
  }

  if (!pregunta) {
    return (
      <CAlert
        color="warning"
        className="m-4"
      >
        No hay preguntas disponibles.
      </CAlert>
    )
  }

  return (
    <div className="d-flex gap-3 m-4 flex-wrap">
      <CCard className="flex-grow-1">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="fw-bold">
                Candidato:
              </span>{' '}
              {NOMBRE_CANDIDATO}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <CBadge color="info">
                Progreso:{' '}
                {numeroPregunta} de{' '}
                {TOTAL_PREGUNTAS}
              </CBadge>

              <CBadge
                color={
                  tiempoRestante < 60
                    ? 'danger'
                    : 'warning'
                }
              >
                Tiempo restante:{' '}
                {formatearTiempo(
                  tiempoRestante
                )}
              </CBadge>

              <CBadge color="primary">
                Dificultad:{' '}
                {
                  pregunta
                    .nivel_dificultad
                }
              </CBadge>
            </div>
          </div>

          <CProgress
            value={progreso}
            className="mb-4"
          />

          <h5 className="mb-4">
            Pregunta {numeroPregunta}
          </h5>

          <p className="mb-3">
            {pregunta.enunciado}
          </p>

          <CCard className="mb-3 border">
            <CCardBody className="py-3">
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {!grabandoVoz ? (
                  <CButton
                    color="secondary"
                    disabled={
                      enviando ||
                      procesandoVoz ||
                      !monitoreoActivo
                    }
                    onClick={
                      iniciarGrabacionVoz
                    }
                  >
                    Responder por voz
                  </CButton>
                ) : (
                  <CButton
                    color="danger"
                    onClick={
                      detenerGrabacionVoz
                    }
                  >
                    Detener grabación
                  </CButton>
                )}

                {grabandoVoz && (
                  <CBadge color="danger">
                    Grabando...
                  </CBadge>
                )}

                {procesandoVoz && (
                  <span>
                    <CSpinner
                      size="sm"
                      className="me-2"
                    />
                    Transcribiendo audio...
                  </span>
                )}
              </div>

              <small className="d-block mt-2 text-body-secondary">
                Diga “respuesta uno”, “respuesta dos” o lea el texto de la opción.
              </small>

              {textoTranscrito && (
                <CAlert
                  color="info"
                  className="mt-3 mb-0"
                >
                  <strong>
                    Transcripción:
                  </strong>{' '}
                  {textoTranscrito}
                </CAlert>
              )}

              {mensajeVoz && (
                <CAlert
                  color="success"
                  className="mt-3 mb-0"
                >
                  {mensajeVoz}
                </CAlert>
              )}

              {errorVoz && (
                <CAlert
                  color="warning"
                  className="mt-3 mb-0"
                >
                  {errorVoz}
                </CAlert>
              )}
            </CCardBody>
          </CCard>

          {!monitoreoActivo && (
            <CAlert
              color={
                estadoMonitoreo ===
                  'detenido' ||
                estadoMonitoreo ===
                  'error'
                  ? 'danger'
                  : 'warning'
              }
            >
              <strong>
                Monitoreo obligatorio.
              </strong>{' '}

              {monitoreoIniciado
                ? 'El monitoreo fue interrumpido. Reactívelo para continuar. El tiempo continúa avanzando.'
                : 'Active el monitoreo y autorice compartir la pantalla para comenzar la evaluación.'}
            </CAlert>
          )}

          {(pregunta.opciones || []).map(
            (opcion) => (
              <CFormCheck
                key={opcion.id_opcion}
                type="radio"
                name="opcion"
                id={`opcion-${opcion.id_opcion}`}
                label={
                  opcion.texto_opcion
                }
                checked={
                  opcionSeleccionada ===
                  opcion.id_opcion
                }
                onChange={() =>
                  setOpcionSeleccionada(
                    opcion.id_opcion
                  )
                }
                disabled={
                  enviando ||
                  procesandoVoz ||
                  grabandoVoz ||
                  !monitoreoActivo
                }
                className="mb-2"
              />
            )
          )}

          {error && (
            <CAlert
              color="danger"
              className="mt-3"
            >
              {error}
            </CAlert>
          )}

          <div className="d-flex gap-2 mt-4">
            <CButton
              color="primary"
              disabled={
                !opcionSeleccionada ||
                enviando ||
                procesandoVoz ||
                grabandoVoz ||
                !monitoreoActivo
              }
              onClick={
                responderPregunta
              }
            >
              {enviando ? (
                <>
                  <CSpinner
                    size="sm"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : numeroPregunta <
                TOTAL_PREGUNTAS ? (
                'Guardar y continuar'
              ) : (
                'Finalizar examen'
              )}
            </CButton>

            <CButton
              color="danger"
              variant="outline"
              className="ms-auto"
              disabled={
                enviando ||
                procesandoVoz ||
                grabandoVoz ||
                emitiendoCertificado ||
                !monitoreoActivo
              }
              onClick={
                finalizarEvaluacion
              }
            >
              Finalizar ahora
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      <MonitoreoAntifraude
        idEvaluacion={idEvaluacion}
        onEstadoChange={
          manejarEstadoMonitoreo
        }
      />
    </div>
  )
}
