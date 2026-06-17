// pantalla de gestion de privacidad — Pantalla gestión de privacidad (React)
// permite ver los datos de un candidato ficticio y solicitar el olvido (GDPR)
// usa CoreUI for React para mantener el mismo estilo visual que el resto del portal

import { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'

// candidato ficticio con los datos acordados en el sprint planning
// id_candidato = 1, Ana Lopez, estado_gdpr = activo
const CANDIDATO_FICTICIO = {
  id: 1,
  nombre: 'Ana Lopez',
  email: 'ana.lopez@usac.edu.gt',
  universidad: 'USAC',
  estado_gdpr: 'activo',
}

// devuelve el color del badge segun el estado gdpr del candidato
function colorEstado(estado) {
  if (estado === 'activo') return 'success'
  if (estado === 'anonimizado') return 'warning'
  if (estado === 'olvidado') return 'danger'
  return 'secondary'
}

export default function GestionPrivacidad() {
  // candidato que se muestra en pantalla
  const [candidato, setCandidato] = useState(CANDIDATO_FICTICIO)

  // controla si se esta esperando respuesta del endpoint
  const [cargando, setCargando] = useState(false)

  // mensaje de exito o error que se muestra despues de la accion
  const [mensaje, setMensaje] = useState(null)

  // dispara el endpoint POST /api/seguridad/anonimizar/{id}
  // cambia estado_gdpr de activo a olvidado en la base de datos
  async function solicitarOlvido() {
    setCargando(true)
    setMensaje(null)

    try {
      const respuesta = await fetch(
        `http://localhost:4005/api/seguridad/anonimizar/${candidato.id}`,
        { method: 'POST' }
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        // actualizar el estado del candidato en pantalla
        setCandidato((prev) => ({ ...prev, estado_gdpr: 'olvidado' }))
        setMensaje({ tipo: 'success', texto: datos.mensaje })
      } else {
        setMensaje({ tipo: 'danger', texto: datos.error || 'Error al procesar la solicitud' })
      }
    } catch (error) {
      // error de red o endpoint caido
      setMensaje({ tipo: 'danger', texto: 'No se pudo conectar con el servidor de seguridad' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="p-4" style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* titulo de la seccion */}
      <h4 className="mb-4">Gestión de Privacidad</h4>
      <p className="text-medium-emphasis mb-4">
        Desde aqui puedes consultar el estado de privacidad de tu cuenta y ejercer
        tu derecho al olvido conforme al GDPR y legislaciones locales de proteccion
        de datos personales.
      </p>

      {/* tarjeta con los datos del candidato */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Datos del candidato</strong>
        </CCardHeader>
        <CCardBody>

          {/* nombre */}
          <div className="mb-2">
            <span className="text-medium-emphasis">Nombre: </span>
            <strong>{candidato.nombre}</strong>
          </div>

          {/* email */}
          <div className="mb-2">
            <span className="text-medium-emphasis">Correo: </span>
            <strong>{candidato.email}</strong>
          </div>

          {/* universidad */}
          <div className="mb-2">
            <span className="text-medium-emphasis">Universidad: </span>
            <strong>{candidato.universidad}</strong>
          </div>

          {/* estado gdpr con badge de color segun el estado actual */}
          <div className="mb-3">
            <span className="text-medium-emphasis">Estado GDPR: </span>
            <CBadge color={colorEstado(candidato.estado_gdpr)} className="ms-1">
              {candidato.estado_gdpr}
            </CBadge>
          </div>

          {/* boton solicitar olvido — solo visible si el candidato esta activo */}
          {candidato.estado_gdpr === 'activo' && (
            <CButton
              color="danger"
              onClick={solicitarOlvido}
              disabled={cargando}
            >
              {/* muestra spinner mientras espera respuesta del endpoint */}
              {cargando && <CSpinner size="sm" className="me-2" />}
              Solicitar olvido
            </CButton>
          )}

          {/* mensaje informativo cuando el candidato ya fue olvidado */}
          {candidato.estado_gdpr === 'olvidado' && (
            <p className="text-medium-emphasis mt-2 mb-0">
              Tu solicitud de olvido fue procesada. Tus datos personales han sido
              anonimizados conforme al GDPR.
            </p>
          )}

        </CCardBody>
      </CCard>

      {/* alerta de resultado — exito o error */}
      {mensaje && (
        <CAlert color={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </CAlert>
      )}

    </div>
  )
}
