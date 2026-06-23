import { Link } from 'react-router-dom'
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CBadge } from '@coreui/react'

const modulosAdmin = [
  { nombre: 'Ingesta de Datos',        ruta: '/ingesta',     responsable: 'Kevin (202101007)',    estado: 'listo' },
  { nombre: 'Dashboard Analítico',     ruta: '/dashboard',   responsable: 'Nufio (201901444)',    estado: 'listo' },
  { nombre: 'Certificado y Auditoría', ruta: '/certificado', responsable: 'Ludwing (201907608)',  estado: 'listo' },
  { nombre: 'Antifraude',              ruta: '/antifraude',  responsable: 'Allan (202010046)',    estado: 'listo' },
  { nombre: 'Privacidad',              ruta: '/privacidad',  responsable: 'Alejandra (202100239)',estado: 'listo' },
]

const modulosCandidato = [
  { nombre: 'Examen Adaptativo',       ruta: '/examen',      responsable: 'Lizz (201708997)',     estado: 'listo' },
  { nombre: 'Certificado y Auditoría', ruta: '/certificado', responsable: 'Ludwing (201907608)',  estado: 'listo' },
  { nombre: 'Privacidad',              ruta: '/privacidad',  responsable: 'Alejandra (202100239)',estado: 'listo' },
]

function Home() {
  const sesion = (() => {
    try { return JSON.parse(localStorage.getItem('sesion')) }
    catch { return null }
  })()

  const rol = sesion?.rol ?? null
  const nombre = sesion?.nombre ?? null

  const modulos = rol === 'admin' ? modulosAdmin : rol === 'candidato' ? modulosCandidato : []

  const titulo = rol === 'admin'
    ? 'Panel Administrativo'
    : rol === 'candidato'
    ? 'Portal del Candidato'
    : 'PRCCD — Menú Principal'

  const subtitulo = rol === 'admin'
    ? `Bienvenido, ${nombre}. Gestión y monitoreo de la plataforma.`
    : rol === 'candidato'
    ? `Bienvenido, ${nombre}. Aquí puedes realizar tu evaluación y consultar tus certificados.`
    : 'Plataforma Regional de Certificación de Competencias Digitales'

  if (!rol) {
    return (
      <CContainer className="py-5">
        <h2 className="mb-1">PRCCD — Menú Principal</h2>
        <p className="text-muted mb-4">
          Plataforma Regional de Certificación de Competencias Digitales
        </p>
        <p>
          No has iniciado sesión.{' '}
          <Link to="/login" className="btn btn-primary btn-sm">
            Ir al login
          </Link>
        </p>
      </CContainer>
    )
  }

  return (
    <CContainer className="py-5">
      <h2 className="mb-1">{titulo}</h2>
      <p className="text-muted mb-4">{subtitulo}</p>

      <CRow className="g-3">
        {modulos.map((m) => (
          <CCol md={4} key={m.ruta}>
            <CCard>
              <CCardBody>
                <CCardTitle className="d-flex justify-content-between align-items-center">
                  {m.nombre}
                  <CBadge color={m.estado === 'listo' ? 'success' : 'secondary'}>
                    {m.estado}
                  </CBadge>
                </CCardTitle>
                <CCardText className="text-muted small">{m.responsable}</CCardText>
                <Link to={m.ruta} className="btn btn-outline-primary">
                  Abrir
                </Link>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </CContainer>
  )
}

export default Home