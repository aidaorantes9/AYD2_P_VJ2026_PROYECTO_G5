import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'

const API_BASE =
  import.meta.env.VITE_SEGURIDAD_API_URL ||
  'http://localhost:4005'

const ID_CANDIDATO = 1

function colorEstado(estado) {
  if (estado === 'activo') return 'success'
  if (estado === 'anonimizado') return 'warning'
  if (estado === 'olvidado') return 'danger'

  return 'secondary'
}

export default function GestionPrivacidad() {
  const [candidato, setCandidato] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    async function cargarCandidato() {
      try {
        const respuesta = await fetch(
          `${API_BASE}/api/seguridad/candidato/${ID_CANDIDATO}`
        )

        const datos = await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.error || 'No se pudo consultar el candidato'
          )
        }

        setCandidato(datos)
      } catch (error) {
        setMensaje({
          tipo: 'danger',
          texto: error.message,
        })
      } finally {
        setCargandoDatos(false)
      }
    }

    cargarCandidato()
  }, [])

  async function solicitarOlvido() {
    setCargando(true)
    setMensaje(null)

    try {
      const respuesta = await fetch(
        `${API_BASE}/api/seguridad/olvidar/${candidato.id}`,
        {
          method: 'POST',
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error || 'Error al procesar la solicitud'
        )
      }

      setCandidato((anterior) => ({
        ...anterior,
        nombre: null,
        email: null,
        estado_gdpr: 'olvidado',
      }))

      setMensaje({
        tipo: 'success',
        texto: datos.mensaje,
      })
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: error.message,
      })
    } finally {
      setCargando(false)
    }
  }

  if (cargandoDatos) {
    return (
      <div className="p-4 text-center">
        <CSpinner />
        <p className="mt-2">Consultando datos de privacidad...</p>
      </div>
    )
  }

  return (
    <div
      className="p-4"
      style={{
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <h4 className="mb-4">Gestión de Privacidad</h4>

      <p className="text-medium-emphasis mb-4">
        Consulta el estado de privacidad de tu cuenta y ejerce
        el derecho al olvido.
      </p>

      {candidato && (
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Datos del candidato</strong>
          </CCardHeader>

          <CCardBody>
            <div className="mb-2">
              <span className="text-medium-emphasis">
                Nombre:{' '}
              </span>

              <strong>
                {candidato.nombre || 'Dato anonimizado'}
              </strong>
            </div>

            <div className="mb-2">
              <span className="text-medium-emphasis">
                Correo:{' '}
              </span>

              <strong>
                {candidato.email || 'Dato anonimizado'}
              </strong>
            </div>

            <div className="mb-3">
              <span className="text-medium-emphasis">
                Estado GDPR:{' '}
              </span>

              <CBadge
                color={colorEstado(candidato.estado_gdpr)}
                className="ms-1"
              >
                {candidato.estado_gdpr}
              </CBadge>
            </div>

            {candidato.estado_gdpr === 'activo' && (
              <CButton
                color="danger"
                onClick={solicitarOlvido}
                disabled={cargando}
              >
                {cargando && (
                  <CSpinner size="sm" className="me-2" />
                )}

                Solicitar olvido
              </CButton>
            )}

            {candidato.estado_gdpr === 'olvidado' && (
              <p className="text-medium-emphasis mt-2 mb-0">
                La solicitud fue procesada y los datos personales
                ya no están disponibles.
              </p>
            )}
          </CCardBody>
        </CCard>
      )}

      {mensaje && (
        <CAlert
          color={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </CAlert>
      )}
    </div>
  )
}