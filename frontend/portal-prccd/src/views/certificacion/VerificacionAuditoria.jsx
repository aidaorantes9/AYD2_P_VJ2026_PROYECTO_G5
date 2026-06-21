import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  CAlert,
  CButton,
  CSpinner,
} from '@coreui/react'

import CertificadoVisual, {
  descargarCertificadoPdf,
} from './CertificadoVisual'

const API_BASE =
  import.meta.env.VITE_CERTIFICACION_API_URL ||
  'http://localhost:4003'

export default function VerificacionAuditoria() {
  const navigate = useNavigate()
  const location = useLocation()
  const certificadoRef = useRef(null)

  const [codigo, setCodigo] = useState('')

  const [resultado, setResultado] = useState(
    location.state?.resultado || null
  )

  const [cargando, setCargando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (location.state?.resultado) {
      setResultado(
        location.state.resultado
      )
      setError('')
    }
  }, [location.state])

  async function verificar(evento) {
    evento.preventDefault()

    const codigoLimpio = codigo.trim()

    if (!codigoLimpio) {
      setError(
        'Ingrese un código de verificación'
      )
      return
    }

    setCargando(true)
    setError('')

    try {
      const respuesta = await fetch(
        `${API_BASE}/api/auditoria/verificar/${encodeURIComponent(
          codigoLimpio
        )}`
      )

      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.valido) {
        throw new Error(
          datos.error ||
            datos.mensaje ||
            'El certificado no es válido'
        )
      }

      setResultado(datos)
    } catch (err) {
      setResultado(null)
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function descargar() {
    if (!resultado?.certificado) {
      return
    }

    try {
      setDescargando(true)
      setError('')

      await descargarCertificadoPdf(
        certificadoRef.current,
        resultado.certificado
          .codigo_verificacion
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setDescargando(false)
    }
  }

  function limpiar() {
    setCodigo('')
    setResultado(null)
    setError('')

    navigate('/certificado', {
      replace: true,
      state: null,
    })
  }

  if (resultado) {
    const certificado =
      resultado.certificado

    const datos =
      certificado.datos || {}

    const aprobado =
      String(
        datos.resultado || ''
      ).toUpperCase() === 'APROBADO'

    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '40px auto',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '14px',
            border: '2px solid #4b5563',
            borderRadius: '6px',
            backgroundColor: '#edf1f7',
            fontSize: '22px',
            fontWeight: '800',
          }}
        >
          Resultado de la evaluación
        </div>

        <div
          style={{
            width: '350px',
            maxWidth: '90%',
            margin: '24px auto',
            padding: '20px',
            border: `3px solid ${
              aprobado
                ? '#159447'
                : '#dc2626'
            }`,
            borderRadius: '9px',
            backgroundColor: aprobado
              ? '#dcfce7'
              : '#fee2e2',
            color: aprobado
              ? '#15803d'
              : '#b91c1c',
            fontSize: '31px',
            fontWeight: '900',
          }}
        >
          {datos.resultado || 'APROBADO'}
        </div>

        <h4
          style={{
            margin: '28px 0',
            fontWeight: '800',
          }}
        >
          ¡Felicidades! Ha obtenido la
          certificación regional de competencias
          digitales.
        </h4>

        <div
          style={{
            padding: '14px',
            border: '1px solid #cbd5e1',
            borderRadius: '5px',
            backgroundColor: '#f8fafc',
            fontWeight: '700',
            overflowWrap: 'anywhere',
          }}
        >
          Certificado:{' '}
          {certificado.codigo_verificacion}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '28px',
            marginTop: '36px',
          }}
        >
          <CButton
            color="primary"
            size="lg"
            disabled={descargando}
            onClick={descargar}
          >
            {descargando ? (
              <>
                <CSpinner
                  size="sm"
                  className="me-2"
                />
                Generando PDF...
              </>
            ) : (
              'Descargar certificado digital'
            )}
          </CButton>

          <CButton
            color="success"
            size="lg"
            onClick={() =>
              navigate(
                `/certificado/ver/${certificado.codigo_verificacion}`,
                {
                  state: {
                    resultado,
                  },
                }
              )
            }
          >
            Verificar autenticidad
          </CButton>
        </div>

        <div
          style={{
            marginTop: '35px',
            padding: '13px',
            border: '2px solid #c47818',
            borderRadius: '5px',
            backgroundColor: '#fff4ca',
            color: '#a85d10',
            fontWeight: '800',
          }}
        >
          Aviso de privacidad y validez
        </div>

        <p
          style={{
            marginTop: '25px',
            color: '#6b7280',
          }}
        >
          El documento incorpora firma
          electrónica, código de verificación y
          rastro de auditoría. La descarga y el
          tratamiento de datos se realizan conforme
          al GDPR y a las políticas regionales
          aplicables.
        </p>

        {error && (
          <CAlert color="danger">
            {error}
          </CAlert>
        )}

        <CButton
          color="secondary"
          variant="outline"
          onClick={limpiar}
        >
          Consultar otro certificado
        </CButton>

        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-12000px',
            top: 0,
            width: '1120px',
            pointerEvents: 'none',
          }}
        >
          <CertificadoVisual
            ref={certificadoRef}
            resultado={resultado}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '30px auto',
        padding: '0 20px',
      }}
    >
      <h2>
        Verificación de certificados
      </h2>

      <p className="text-muted">
        Consulte la autenticidad del certificado,
        su firma electrónica y el rastro inmutable
        de auditoría.
      </p>

      <form
        onSubmit={verificar}
        style={{
          padding: '20px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          backgroundColor: '#f8fafc',
        }}
      >
        <label
          htmlFor="codigo-certificado"
          style={{
            display: 'block',
            fontWeight: '700',
            marginBottom: '8px',
          }}
        >
          Código de verificación
        </label>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <input
            id="codigo-certificado"
            type="text"
            value={codigo}
            onChange={(event) =>
              setCodigo(event.target.value)
            }
            placeholder="Ingrese el identificador del certificado"
            style={{
              flex: '1 1 420px',
              minWidth: 0,
              padding: '11px',
              border: '2px solid #8b5cf6',
              borderRadius: '6px',
            }}
          />

          <CButton
            type="submit"
            color="primary"
            disabled={cargando}
            style={{
              minWidth: '235px',
            }}
          >
            {cargando ? (
              <>
                <CSpinner
                  size="sm"
                  className="me-2"
                />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </CButton>
        </div>
      </form>

      {error && (
        <CAlert
          color="danger"
          className="mt-3"
        >
          {error}
        </CAlert>
      )}
    </div>
  )
}