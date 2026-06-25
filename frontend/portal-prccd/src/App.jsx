import { BrowserRouter, Routes, Route } from 'react-router-dom'
// Componentes
import Navbar from './componentes/Navbar'
import Footer from './componentes/Footer'
import Sidebar from './componentes/Sidebar'
import RutaProtegida from './componentes/RutaProtegida'
// Vistas
import Home from './views/Home'
import LoginIntegracion from './pages/LoginIntegracion'
import GestionPrivacidad from './views/seguridad/GestionPrivacidad'
import VerificacionAuditoria from './views/certificacion/VerificacionAuditoria'
import Dashboard from './views/dashboard/Dashboard'
import Examen from './views/evaluacion/Examen'
import PanelIngestionDatos from './views/integracion/PanelIngestionDatos'
import AuditoriaReportes from './views/certificacion/AuditoriaReportes'
import CertificadoDetalle from './views/certificacion/CertificadoDetalle'

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="d-flex flex-grow-1">
          <Sidebar />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <Routes>
              {/* Pública */}
              <Route path="/login" element={<LoginIntegracion />} />

              {/* Ambos roles */}
              <Route path="/" element={
                <RutaProtegida roles={['admin', 'candidato']}>
                  <Home />
                </RutaProtegida>
              } />

              {/* Solo admin */}
              <Route path="/ingesta" element={
                <RutaProtegida roles={['admin']}>
                  <PanelIngestionDatos />
                </RutaProtegida>
              } />
              <Route path="/dashboard" element={
                <RutaProtegida roles={['admin']}>
                  <Dashboard />
                </RutaProtegida>
              } />
              <Route path="/antifraude" element={
                <RutaProtegida roles={['admin']}>
                  <AuditoriaReportes />
                </RutaProtegida>
              } />
              <Route path="/privacidad" element={
                <RutaProtegida roles={['admin', 'candidato']}>
                  <GestionPrivacidad />
                </RutaProtegida>
              } />
              <Route path="/certificado" element={
                <RutaProtegida roles={['admin', 'candidato']}>
                  <VerificacionAuditoria />
                </RutaProtegida>
              } />
              <Route path="/certificado/ver/:codigo" element={
                <RutaProtegida roles={['admin', 'candidato']}>
                  <CertificadoDetalle />
                </RutaProtegida>
              } />

              {/* Solo candidato */}
              <Route path="/examen" element={
                <RutaProtegida roles={['candidato']}>
                  <Examen />
                </RutaProtegida>
              } />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App