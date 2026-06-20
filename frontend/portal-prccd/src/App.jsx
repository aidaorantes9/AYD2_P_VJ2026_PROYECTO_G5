import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Componentes
import Navbar from './componentes/Navbar'
import Footer from './componentes/Footer'
import Sidebar from './componentes/Sidebar'

// Vistas
import Home from './views/Home'
import GestionPrivacidad from './views/seguridad/GestionPrivacidad'
import VerificacionAuditoria from './views/certificacion/VerificacionAuditoria'
import Dashboard from './views/dashboard/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">

        <Navbar />

        <div className="d-flex flex-grow-1">
          <Sidebar />

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/certificado" element={<VerificacionAuditoria />} />
              <Route path="/privacidad" element={<GestionPrivacidad />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>

        <Footer />

      </div>
    </BrowserRouter>
  )
}

export default App