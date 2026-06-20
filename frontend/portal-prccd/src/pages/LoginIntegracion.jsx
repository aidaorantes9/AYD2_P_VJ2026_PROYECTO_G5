import { useMemo, useState } from 'react'
import { CContainer, CCard, CCardBody, CFormInput, CFormSelect, CButton, CBadge, CAlert } from '@coreui/react'

import FachadaIntegracion from '../facades/FachadaIntegracion'

function LoginIntegracion() {
    
  const universidades = FachadaIntegracion.obtenerUniversidades()

  const [idUniversidad, setIdUniversidad] = useState('')
  const [usuario, setUsuario] = useState('')
  const [credencial, setCredencial] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const universidadSeleccionada = useMemo(() => {
    if (!idUniversidad) return null
    return FachadaIntegracion.obtenerUniversidadPorId(Number(idUniversidad))
  }, [idUniversidad])

  const textoCredencial = useMemo(() => {
    if (!universidadSeleccionada) return 'Credencial'

    if (universidadSeleccionada.protocolo_auth === 'LDAP') {
      return 'Contrasena'
    }

    if (universidadSeleccionada.protocolo_auth === 'SAML') {
      return 'Assertion SAML'
    }

    return 'Token OAuth2'
  }, [universidadSeleccionada])

  function cambiarUniversidad(event) {
    setIdUniversidad(event.target.value)
    setUsuario('')
    setCredencial('')
    setResultado(null)
    setError('')
  }

  function validarFormulario() {
    if (!idUniversidad) {
      return 'Debe seleccionar una institucion.'
    }

    if (!usuario.trim()) {
      return 'Debe ingresar el usuario institucional.'
    }

    if (!credencial.trim()) {
      return `Debe ingresar ${textoCredencial.toLowerCase()}.`
    }

    return ''
  }

  async function iniciarSesion(event) {
    event.preventDefault()

    setResultado(null)
    setError('')

    const mensajeValidacion = validarFormulario()

    if (mensajeValidacion) {
      setError(mensajeValidacion)
      return
    }

    setCargando(true)

    try {
      const respuesta = await FachadaIntegracion.iniciarSesionUniversidad({
        id_universidad: Number(idUniversidad),
        usuario: usuario.trim(),
        credencial: credencial.trim(),
      })

      setResultado(respuesta)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <CContainer fluid style={{ padding: '32px' }}>
      <CCard
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          borderRadius: '24px',
          border: '2px solid #374151',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <CCardBody style={{ padding: 0 }}>
          <div
            style={{
              backgroundColor: '#eef2f6',
              borderBottom: '2px solid #374151',
              padding: '14px 22px',
            }}
          >
            <h4 style={{ margin: 0, fontWeight: 700 }}>
              Portal Regional de Certificaciones
            </h4>
          </div>

          <div style={{ padding: '18px 22px 30px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <small style={{ color: '#6b7280' }}>
                Acceso del candidato con autenticacion federada por institucion.
              </small>
            </div>

            <div
              style={{
                maxWidth: '520px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    border: '2px solid #6b7280',
                    borderRadius: '6px',
                    backgroundColor: '#eef2f6',
                    padding: '8px 14px',
                    fontSize: '16px',
                  }}
                >
                  Ingreso al portal
                </div>
              </div>

              <form onSubmit={iniciarSesion}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    Institucion
                  </label>

                  <CFormSelect value={idUniversidad} onChange={cambiarUniversidad}>
                    <option value="">Seleccione su universidad</option>
                    {universidades.map((universidad) => (
                      <option
                        key={universidad.id_universidad}
                        value={universidad.id_universidad}
                      >
                        {universidad.siglas} - {universidad.nombre}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    Usuario institucional
                  </label>

                  <CFormInput
                    type="text"
                    placeholder="usuario@universidad.edu"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    {textoCredencial}
                  </label>

                  <CFormInput
                    type="password"
                    placeholder={`Ingrese ${textoCredencial.toLowerCase()}`}
                    value={credencial}
                    onChange={(event) => setCredencial(event.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    flexWrap: 'wrap',
                    marginBottom: '10px',
                  }}
                >
                  <CButton
                    type="submit"
                    color="primary"
                    disabled={cargando}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      fontWeight: 700,
                    }}
                  >
                    {cargando ? 'Validando...' : 'Ingresar'}
                  </CButton>

                </div>
              </form>

              <div
                style={{
                  border: '1px solid #7dd3c7',
                  backgroundColor: '#d1fae5',
                  color: '#0f766e',
                  borderRadius: '6px',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  marginBottom: '20px',
                }}
              >
                Autenticacion federada disponible: LDAP | SAML | OAuth2
              </div>

              {universidadSeleccionada && (
                <div
                  style={{
                    marginBottom: '18px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <div style={{ marginBottom: '8px', fontWeight: 600 }}>
                    Configuracion detectada
                  </div>

                  <CBadge color="primary" style={{ marginRight: '8px' }}>
                    {universidadSeleccionada.protocolo_auth}
                  </CBadge>

                  <CBadge color="secondary">
                    {universidadSeleccionada.formato_datos}
                  </CBadge>
                </div>
              )}

              {error && (
                <CAlert color="danger">
                  <strong>No se pudo validar:</strong> {error}
                </CAlert>
              )}

              {resultado && (
                <CAlert color="success">
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Resultado de la integracion</strong>
                  </div>

                  <div>Universidad: {resultado.resultado?.universidad}</div>
                  <div>Protocolo usado: {resultado.resultado?.protocolo_usado}</div>
                  <div>Formato de datos: {resultado.resultado?.formato_datos}</div>
                  <div>Usuario externo: {resultado.resultado?.usuario_externo}</div>
                  <div>Estado: {resultado.resultado?.mensaje}</div>
                </CAlert>
              )}

              <div
                style={{
                  marginTop: '18px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '12px',
                }}
              >
                La plataforma selecciona el protocolo configurado para la institucion
                y mantiene una interfaz de acceso unificada.
              </div>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default LoginIntegracion