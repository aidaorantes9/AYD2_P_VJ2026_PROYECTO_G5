import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CSidebar, CSidebarNav, CNavItem, CNavTitle, CHeader, CContainer } from '@coreui/react'
import Home from './componentes/Home'
// importar pantalla de gestion de privacidad del modulo de seguridad
import GestionPrivacidad from './views/seguridad/GestionPrivacidad'

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex">
        <CSidebar className="border-end" unfoldable>
          <CSidebarNav>
            <CNavTitle>PRCCD</CNavTitle>
            <CNavItem component={Link} to="/">Inicio</CNavItem>
            {/* ruta de gestion de privacidad — modulo seguridad transversal SM */}
            <CNavItem component={Link} to="/privacidad">Privacidad</CNavItem>
          </CSidebarNav>
        </CSidebar>
        <div className="flex-grow-1">
          <CHeader>
            <CContainer fluid>
              <span className="fw-bold">Plataforma Regional de Certificación de Competencias Digitales</span>
            </CContainer>
          </CHeader>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* pantalla de gestion de privacidad y derecho al olvido GDPR */}
            <Route path="/privacidad" element={<GestionPrivacidad />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
export default App