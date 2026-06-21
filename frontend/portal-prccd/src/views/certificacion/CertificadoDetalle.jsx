import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
  useParams,
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

export default function CertificadoDetalle() {
  const { codigo } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const certificadoRef = useRef(null)

  const [resultado, setResultado] = useState(
    location.state?.resultado || null
  )

  const [cargando, setCargando] = useState(
    !location.state?.resultado
  )

  const [descargando, setDescargando] =
    useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    if (resultado) return

    async function cargar() {
      try {
        const respuesta = await fetch(
          `${API_BASE}/api/auditoria/verificar/${encodeURIComponent(
            codigo
          )}`
        )

        const datos = await respuesta.json()

        if (!respuesta.ok || !datos.valido) {
          throw new Error(
            datos.error ||
              datos.mensaje ||
              'Certificado no válido'
          )
        }

        setResultado(datos)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [codigo, resultado])

  async function descargar() {
    try {
      setDescargando(true)
      setError('')

      await descargarCertificadoPdf(
        certificadoRef.current,
        codigo
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setDescargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="text-center p-5">
        <CSpinner />

        <p className="mt-3">
          Verificando certificado...
        </p>
      </div>
    )
  }

  if (error || !resultado) {
    return (
      <CAlert color="danger" className="m-4">
        {error || 'Certificado no disponible'}
      </CAlert>
    )
  }

  const integridad =
    resultado.integridad_certificado || {}

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto 20px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <CButton
          color="secondary"
          variant="outline"
          onClick={() =>
            navigate('/certificado')
          }
        >
          Volver a consultar
        </CButton>

        <CButton
          color="primary"
          disabled={descargando}
          onClick={descargar}
        >
          {descargando
            ? 'Generando PDF...'
            : 'Descargar PDF'}
        </CButton>
      </div>

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '1120px',
            minWidth: '1120px',
            transformOrigin: 'top center',
          }}
        >
          <CertificadoVisual
            ref={certificadoRef}
            resultado={resultado}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: '1040px',
          margin: '20px auto',
          padding: '18px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
        }}
      >
        <h5>Validación de autenticidad</h5>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <Estado
            etiqueta="Hash del certificado"
            valido={integridad.hash_valido}
          />

          <Estado
            etiqueta="Firma electrónica"
            valido={integridad.firma_valida}
          />

          <Estado
            etiqueta="Vigencia"
            valido={
              integridad.certificado_vigente
            }
          />
        </div>

        <p
          style={{
            marginTop: '18px',
            marginBottom: 0,
            overflowWrap: 'anywhere',
            color: '#6b7280',
            fontSize: '13px',
          }}
        >
          Hash SHA-256:{' '}
          {integridad.hash_almacenado}
        </p>
      </div>
    </div>
  )
}

function Estado({
  etiqueta,
  valido,
}) {
  return (
    <div
      style={{
        padding: '13px',
        border: `1px solid ${
          valido ? '#22c55e' : '#ef4444'
        }`,
        borderRadius: '6px',
        backgroundColor: valido
          ? '#dcfce7'
          : '#fee2e2',
      }}
    >
      <strong>{etiqueta}:</strong>{' '}

      <span
        style={{
          color: valido
            ? '#15803d'
            : '#b91c1c',
          fontWeight: '800',
        }}
      >
        {valido ? 'Válido' : 'No válido'}
      </span>
    </div>
  )
}