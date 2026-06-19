import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CSidebar, CSidebarNav, CNavItem, CNavTitle, CHeader, CContainer } from '@coreui/react'
import Home from './componentes/Home'
// importar pantalla de gestion de privacidad del modulo de seguridad
import GestionPrivacidad from './views/seguridad/GestionPrivacidad'
import VerificacionAuditoria from './views/certificacion/VerificacionAuditoria'

// para el login que estoy agregando yo (Kevin jaja)
import LoginIntegracion from './pages/LoginIntegracion'

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex min-vh-100">
        <CSidebar
          className="border-end flex-shrink-0"
          style={{ width: '240px', minWidth: '240px' }}
        >
          <CSidebarNav>
            <CNavTitle>PRCCD</CNavTitle>
            <CNavItem component={Link} to="/">Inicio</CNavItem>
            {/* ruta de gestion de privacidad — modulo seguridad transversal SM */}
            { /* es de prueba por el momento esta linea de abajo que he agregado */ }
            <CNavItem component={Link} to="/login">Login Integración</CNavItem>

            <CNavItem component={Link} to="/certificado">
              Certificados y Auditoría
            </CNavItem>
            <CNavItem component={Link} to="/privacidad">Privacidad</CNavItem>
          </CSidebarNav>
        </CSidebar>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <CHeader>
            <CContainer fluid>
              <span className="fw-bold">Plataforma Regional de Certificación de Competencias Digitales</span>
            </CContainer>
          </CHeader>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* pantalla de gestion de privacidad y derecho al olvido GDPR */}

            {/* pantalla de login para seleccion de universidad y protocolo */}
            <Route path="/login-integracion" element={<LoginIntegracion />} />

            <Route
              path="/certificado"
              element={<VerificacionAuditoria />}
            />
            <Route path="/privacidad" element={<GestionPrivacidad />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
export default App