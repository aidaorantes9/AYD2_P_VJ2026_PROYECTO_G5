import { Link } from 'react-router-dom'
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CBadge } from '@coreui/react'

const modulos = [
  { nombre: 'Login', ruta: '/login', responsable: 'Kevin (202101007)', estado: 'pendiente' },
  { nombre: 'Examen Adaptativo', ruta: '/examen', responsable: 'Lizz (201708997)', estado: 'pendiente' },
  { nombre: 'Certificado y Auditoría', ruta: '/certificado', responsable: 'Ludwing (201907608)', estado: 'listo' },
  { nombre: 'Antifraude', ruta: '/antifraude', responsable: 'Allan (202010046)', estado: 'pendiente' },
  { nombre: 'Dashboard Analítico', ruta: '/dashboard', responsable: 'Nufio (201901444)', estado: 'pendiente' },
  { nombre: 'Privacidad', ruta: '/privacidad', responsable: 'Alejandra (202100239)', estado: 'pendiente' },
]

function Home() {
  return (
    <CContainer className="py-5">
      <h2 className="mb-1">PRCCD — Menú Principal</h2>
      <p className="text-muted mb-4">
        Plataforma Regional de Certificación de Competencias Digitales
      </p>

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