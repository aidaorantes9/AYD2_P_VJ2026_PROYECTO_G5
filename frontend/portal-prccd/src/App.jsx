import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CSidebar, CSidebarNav, CNavItem, CNavTitle, CHeader, CContainer } from '@coreui/react'

import Home from './componentes/Home'
import Examen from './pages/Examen'

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex">
        <CSidebar className="border-end" unfoldable>
          <CSidebarNav>
            <CNavTitle>PRCCD</CNavTitle>
            <CNavItem component={Link} to="/">Inicio</CNavItem>
            <CNavItem component={Link} to="/examen">Examen</CNavItem>
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
            <Route path="/examen" element={<Examen />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App