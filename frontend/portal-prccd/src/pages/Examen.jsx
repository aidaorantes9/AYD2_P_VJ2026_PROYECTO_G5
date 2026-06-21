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

const API_BASE =
  import.meta.env.VITE_EVALUACIONES_API_URL ||
  'http://localhost:4001'

const CERTIFICACION_API_BASE =
  import.meta.env.VITE_CERTIFICACION_API_URL ||
  'http://localhost:4003'

const TOTAL_PREGUNTAS = 10
const ID_CANDIDATO = 1
const TIEMPO_TOTAL_SEG = 30 * 60

export default function Examen() {
  const navigate = useNavigate()

  const [idEvaluacion, setIdEvaluacion] = useState(null)
  const [pregunta, setPregunta] = useState(null)
  const [numeroPregunta, setNumeroPregunta] = useState(1)
  const [opcionSeleccionada, setOpcionSeleccionada] =
    useState(null)

  const [resultado, setResultado] = useState(null)
  const [terminado, setTerminado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [emitiendoCertificado, setEmitiendoCertificado] =
    useState(false)

  const [error, setError] = useState('')

  const [tiempoRestante, setTiempoRestante] =
    useState(TIEMPO_TOTAL_SEG)

  const tiempoInicioPregunta = useRef(Date.now())
  const finalizando = useRef(false)

  useEffect(() => {
    async function iniciarEvaluacion() {
      try {
        setError('')

        const respuesta = await fetch(
          `${API_BASE}/api/evaluacion/${ID_CANDIDATO}/iniciar`,
          {
            method: 'POST',
          }
        )

        const datos = await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.error ||
              'No se pudo iniciar la evaluación'
          )
        }

        setIdEvaluacion(datos.id_evaluacion)
        setPregunta(datos.pregunta)
        setNumeroPregunta(datos.numero_pregunta)

        tiempoInicioPregunta.current = Date.now()
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    iniciarEvaluacion()
  }, [])

  const emitirCertificadoAutomaticamente = useCallback(
    async (resultadoEvaluacion) => {
      if (
        !resultadoEvaluacion?.id_evaluacion ||
        emitiendoCertificado
      ) {
        return false
      }

      setEmitiendoCertificado(true)
      setError('')

      try {
        const respuestaEmision = await fetch(
          `${CERTIFICACION_API_BASE}/api/certificados/emitir`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_candidato: ID_CANDIDATO,
              id_evaluacion:
                resultadoEvaluacion.id_evaluacion,
              actor: 'Sistema PRCCD',
              datos_certificado: {
                nombre_candidato: 'Ana Lopez',
                universidad:
                  'Universidad de San Carlos de Guatemala',
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

        const respuestaVerificacion = await fetch(
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
            resultado: datosVerificacion,
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

  const finalizarEvaluacion = useCallback(async () => {
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
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_evaluacion: idEvaluacion,
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            'No se pudo finalizar la evaluación'
        )
      }

      setResultado(datos)
      setTerminado(true)

      if (datos.aprobada) {
        await emitirCertificadoAutomaticamente(datos)
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

  useEffect(() => {
    if (
      cargando ||
      terminado ||
      !idEvaluacion ||
      tiempoRestante <= 0
    ) {
      return undefined
    }

    const intervalo = setInterval(() => {
      setTiempoRestante((anterior) =>
        Math.max(anterior - 1, 0)
      )
    }, 1000)

    return () => clearInterval(intervalo)
  }, [
    cargando,
    terminado,
    idEvaluacion,
    tiempoRestante,
  ])

  useEffect(() => {
    if (
      tiempoRestante === 0 &&
      idEvaluacion &&
      !terminado
    ) {
      finalizarEvaluacion()
    }
  }, [
    tiempoRestante,
    idEvaluacion,
    terminado,
    finalizarEvaluacion,
  ])

  function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60

    return `${minutos}:${segundosRestantes
      .toString()
      .padStart(2, '0')}`
  }

  async function responderPregunta() {
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
        Date.now() - tiempoInicioPregunta.current

      const respuesta = await fetch(
        `${API_BASE}/api/evaluacion/respuesta`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_candidato: ID_CANDIDATO,
            id_evaluacion: idEvaluacion,
            id_pregunta: pregunta.id_pregunta,
            id_opcion_seleccionada:
              opcionSeleccionada,
            tiempo_respuesta_ms:
              tiempoRespuesta,
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            'No se pudo registrar la respuesta'
        )
      }

      if (datos.terminado) {
        setResultado(datos.resultado)
        setTerminado(true)

        if (datos.resultado.aprobada) {
          await emitirCertificadoAutomaticamente(
            datos.resultado
          )
        }

        return
      }

      setPregunta(datos.siguiente_pregunta)
      setNumeroPregunta(datos.numero_pregunta)
      setOpcionSeleccionada(null)

      tiempoInicioPregunta.current = Date.now()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const progreso =
    (numeroPregunta / TOTAL_PREGUNTAS) * 100

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
          <h4>Resultado del examen</h4>

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
            Correctas: {resultado.correctas} de{' '}
            {resultado.total}
          </p>

          {resultado.respondidas !== undefined && (
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
              Emitiendo y verificando su certificado...
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
              disabled={emitiendoCertificado}
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
      <CAlert color="danger" className="m-4">
        {error}
      </CAlert>
    )
  }

  if (!pregunta) {
    return (
      <CAlert color="warning" className="m-4">
        No hay preguntas disponibles.
      </CAlert>
    )
  }

  const monitoreoSimulado = {
    camara: 'Estado: activo y autorizado',
    tecleo: 'Evidencia almacenada',
    fraude: 'Sin alertas críticas',
  }

  return (
    <div className="d-flex gap-3 m-4">
      <CCard className="flex-grow-1">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="fw-bold">
                Candidato:
              </span>{' '}
              Ana López
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <CBadge color="info">
                Progreso: {numeroPregunta} de{' '}
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
                {pregunta.nivel_dificultad}
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

          {(pregunta.opciones || []).map(
            (opcion) => (
              <CFormCheck
                key={opcion.id_opcion}
                type="radio"
                name="opcion"
                id={`opcion-${opcion.id_opcion}`}
                label={opcion.texto_opcion}
                checked={
                  opcionSeleccionada ===
                  opcion.id_opcion
                }
                onChange={() =>
                  setOpcionSeleccionada(
                    opcion.id_opcion
                  )
                }
                disabled={enviando}
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
                enviando
              }
              onClick={responderPregunta}
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
                emitiendoCertificado
              }
              onClick={finalizarEvaluacion}
            >
              Finalizar ahora
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      <CCard
        style={{
          minWidth: '260px',
          maxWidth: '260px',
        }}
      >
        <CCardBody>
          <h6 className="mb-3">
            Monitoreo de integridad
          </h6>

          <div className="mb-3">
            <CBadge
              color="success"
              className="mb-1"
            >
              Cámara y sesión
            </CBadge>

            <p className="small text-muted mb-0">
              {monitoreoSimulado.camara}
            </p>
          </div>

          <div className="mb-3">
            <CBadge
              color="success"
              className="mb-1"
            >
              Registro de tecleo
            </CBadge>

            <p className="small text-muted mb-0">
              {monitoreoSimulado.tecleo}
            </p>
          </div>

          <div className="mb-3">
            <CBadge
              color="warning"
              className="mb-1"
            >
              Análisis antifraude
            </CBadge>

            <p className="small text-muted mb-0">
              {monitoreoSimulado.fraude}
            </p>
          </div>

          <p className="small text-muted mt-3 mb-0">
            Datos simulados — pendiente integración
            con el módulo Antifraude.
          </p>
        </CCardBody>
      </CCard>
    </div>
  )
}