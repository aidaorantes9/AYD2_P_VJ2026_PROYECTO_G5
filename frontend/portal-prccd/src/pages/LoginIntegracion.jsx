import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer, CCard, CCardBody, CFormInput,
  CFormSelect, CButton, CBadge, CAlert, CNav,
  CNavItem, CNavLink
} from '@coreui/react'
import FachadaIntegracion from '../facades/FachadaIntegracion'

const API_BASE_URL = import.meta.env.VITE_INTEGRACION_API_URL || 'http://136.114.93.149:4002'

function LoginIntegracion() {
  const navigate = useNavigate()
  const universidades = FachadaIntegracion.obtenerUniversidades()

  // ── Modo: 'candidato' | 'admin'
  const [modo, setModo] = useState('candidato')

  // ── Estado candidato
  const [idUniversidad, setIdUniversidad] = useState('')
  const [usuario, setUsuario] = useState('')
  const [credencial, setCredencial] = useState('')

  // ── Estado admin
  const [adminUsuario, setAdminUsuario] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // ── Compartidos
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const universidadSeleccionada = useMemo(() => {
    if (!idUniversidad) return null
    return FachadaIntegracion.obtenerUniversidadPorId(Number(idUniversidad))
  }, [idUniversidad])

  const textoCredencial = useMemo(() => {
    if (!universidadSeleccionada) return 'Credencial'
    if (universidadSeleccionada.protocolo_auth === 'LDAP') return 'Contraseña'
    if (universidadSeleccionada.protocolo_auth === 'SAML') return 'Assertion SAML'
    return 'Token OAuth2'
  }, [universidadSeleccionada])

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo)
    setError('')
    setResultado(null)
  }

  function cambiarUniversidad(event) {
    setIdUniversidad(event.target.value)
    setUsuario('')
    setCredencial('')
    setResultado(null)
    setError('')
  }

  // ── Login administrador (valores quemados)
  async function iniciarSesionAdmin(event) {
    event.preventDefault()
    setError('')
    setResultado(null)

    if (!adminUsuario.trim() || !adminPassword.trim()) {
      setError('Debe ingresar usuario y contraseña.')
      return
    }

    if (adminUsuario.trim() !== 'admin' || adminPassword.trim() !== 'admin') {
      setError('Credenciales de administrador incorrectas.')
      return
    }

    setCargando(true)
    // Simular latencia mínima para que no parezca instantáneo
    await new Promise(r => setTimeout(r, 400))

    const sesion = {
      autenticado: true,
      rol: 'admin',
      idCandidato: null,
      idUniversidad: null,
      nombre: 'Administrador',
      universidad: 'PRCCD',
      proveedor: 'local',
    }
    sessionStorage.setItem('sesion', JSON.stringify(sesion))
    localStorage.removeItem('sesion')
    setCargando(false)
    navigate('/')
  }

  // ── Login candidato (flujo existente)
  function validarFormularioCandidato() {
    if (!idUniversidad) return 'Debe seleccionar una institución.'
    if (!usuario.trim()) return 'Debe ingresar el usuario institucional.'
    if (!credencial.trim()) return `Debe ingresar ${textoCredencial.toLowerCase()}.`
    return ''
  }

  // ahora si un login digno de va jaja 
  async function iniciarSesionCandidato(event) {

    event.preventDefault()
    setResultado(null)
    setError('')

    const mensajeValidacion = validarFormularioCandidato()

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

      /* ESTO ES PARA LA PERSISTENCIA DEL CANDIDATO VERDAD: */
      const candidato = respuesta.resultado || {}

      const sesion = {
        autenticado: true,
        rol: 'candidato',

        idCandidato: Number(candidato.id_candidato),
        idUniversidad: Number(candidato.id_universidad || idUniversidad),

        nombre: candidato.nombre_candidato || candidato.usuario_externo || usuario.trim(),
        email: candidato.email_candidato || candidato.usuario_externo || usuario.trim(),

        universidad: candidato.universidad || universidadSeleccionada?.nombre || '',
        proveedor: candidato.protocolo_usado || universidadSeleccionada?.protocolo_auth || '',
      }

      sessionStorage.setItem('sesion', JSON.stringify(sesion))
      localStorage.removeItem('sesion')
      setResultado(respuesta)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <CContainer fluid style={{ padding: '32px' }}>
      <CCard style={{
        maxWidth: '980px', margin: '0 auto', borderRadius: '24px',
        border: '2px solid #374151', overflow: 'hidden', boxShadow: 'none',
      }}>
        <CCardBody style={{ padding: 0 }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#eef2f6', borderBottom: '2px solid #374151', padding: '14px 22px',
          }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Portal Regional de Certificaciones</h4>
          </div>

          <div style={{ padding: '18px 22px 30px' }}>
            {/* Tabs modo */}
            <CNav variant="tabs" style={{ marginBottom: '24px' }}>
              <CNavItem>
                <CNavLink
                  active={modo === 'candidato'}
                  onClick={() => cambiarModo('candidato')}
                  style={{ cursor: 'pointer', fontWeight: modo === 'candidato' ? 700 : 400 }}
                >
                  Candidato
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={modo === 'admin'}
                  onClick={() => cambiarModo('admin')}
                  style={{ cursor: 'pointer', fontWeight: modo === 'admin' ? 700 : 400 }}
                >
                  Administrador
                </CNavLink>
              </CNavItem>
            </CNav>

            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                border: '2px solid #6b7280', borderRadius: '6px',
                backgroundColor: '#eef2f6', padding: '8px 14px',
                fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '18px',
              }}>
                {modo === 'admin' ? 'Acceso administrativo' : 'Ingreso al portal'}
              </div>

              {/* ── FORMULARIO ADMIN ── */}
              {modo === 'admin' && (
                <form onSubmit={iniciarSesionAdmin}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
                      Usuario
                    </label>
                    <CFormInput
                      type="text"
                      placeholder="admin"
                      value={adminUsuario}
                      onChange={e => setAdminUsuario(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
                      Contraseña
                    </label>
                    <CFormInput
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                    />
                  </div>

                  <CButton
                    type="submit"
                    color="dark"
                    disabled={cargando}
                    style={{ width: '100%', fontWeight: 700, marginBottom: '10px' }}
                  >
                    {cargando ? 'Verificando...' : 'Ingresar como administrador'}
                  </CButton>
                </form>
              )}

              {/* ── FORMULARIO CANDIDATO ── */}
              {modo === 'candidato' && (
                <form onSubmit={iniciarSesionCandidato}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
                      Institución
                    </label>
                    <CFormSelect value={idUniversidad} onChange={cambiarUniversidad}>
                      <option value="">Seleccione su universidad</option>
                      {universidades.map(u => (
                        <option key={u.id_universidad} value={u.id_universidad}>
                          {u.siglas} - {u.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
                      Usuario institucional
                    </label>
                    <CFormInput
                      type="text"
                      placeholder="usuario@universidad.edu"
                      value={usuario}
                      onChange={e => setUsuario(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
                      {textoCredencial}
                    </label>
                    <CFormInput
                      type="password"
                      placeholder={`Ingrese ${textoCredencial.toLowerCase()}`}
                      value={credencial}
                      onChange={e => setCredencial(e.target.value)}
                    />
                  </div>

                  <CButton
                    type="submit"
                    color="primary"
                    disabled={cargando}
                    style={{ width: '100%', fontWeight: 700, marginBottom: '10px' }}
                  >
                    {cargando ? 'Validando...' : 'Ingresar'}
                  </CButton>

                  <div style={{
                    border: '1px solid #7dd3c7', backgroundColor: '#d1fae5',
                    color: '#0f766e', borderRadius: '6px', padding: '12px',
                    textAlign: 'center', fontSize: '14px', marginBottom: '16px',
                  }}>
                    Autenticación federada disponible: LDAP | SAML | OAuth2
                  </div>

                  {universidadSeleccionada && (
                    <div style={{
                      marginBottom: '18px', padding: '12px',
                      border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb',
                    }}>
                      <div style={{ marginBottom: '8px', fontWeight: 600 }}>Configuración detectada</div>
                      <CBadge color="primary" style={{ marginRight: '8px' }}>
                        {universidadSeleccionada.protocolo_auth}
                      </CBadge>
                      <CBadge color="secondary">{universidadSeleccionada.formato_datos}</CBadge>
                    </div>
                  )}
                </form>
              )}

              {/* Mensajes compartidos */}
              {error && (
                <CAlert color="danger">
                  <strong>No se pudo validar:</strong> {error}
                </CAlert>
              )}

              <div style={{ marginTop: '18px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                La plataforma selecciona el protocolo configurado para la institución
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