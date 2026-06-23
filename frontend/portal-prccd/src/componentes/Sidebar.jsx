import { NavLink, useNavigate } from 'react-router-dom'
import { CSidebar, CSidebarNav, CNavTitle } from '@coreui/react'

const itemsAdmin = [
  { label: 'Inicio',                  to: '/' },
  { label: 'Ingesta de Datos',        to: '/ingesta' },
  { label: 'Dashboard',               to: '/dashboard' },
  { label: 'Certificados y Auditoría',to: '/certificado' },
  { label: 'Antifraude',              to: '/antifraude' },
  { label: 'Privacidad',              to: '/privacidad' },
]

const itemsCandidato = [
  { label: 'Inicio',                  to: '/' },
  { label: 'Examen Adaptativo',       to: '/examen' },
  { label: 'Certificados y Auditoría',to: '/certificado' },
  { label: 'Privacidad',              to: '/privacidad' },
]

function Sidebar() {
  const navigate = useNavigate()

  const sesion = (() => {
    try { return JSON.parse(sessionStorage.getItem('sesion')) }
    catch { return null }
  })()

  const rol = sesion?.rol ?? null
  const items = rol === 'admin' ? itemsAdmin : rol === 'candidato' ? itemsCandidato : []

  function cerrarSesion() {
    sessionStorage.removeItem('sesion')
    localStorage.removeItem('sesion')
    navigate('/login')
  }

  return (
    <CSidebar
      className="border-end flex-shrink-0"
      style={{ width: '240px', minWidth: '240px' }}
    >
      <CSidebarNav>
        <CNavTitle>PRCCD</CNavTitle>

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-link px-3 py-2 d-block ${isActive ? 'active fw-semibold' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}

        {rol && (
          <>
            <div style={{ borderTop: '1px solid #dee2e6', margin: '8px 0' }} />
            <button
              onClick={cerrarSesion}
              className="nav-link px-3 py-2 d-block w-100 text-start border-0 bg-transparent text-danger"
            >
              Cerrar sesión
            </button>
          </>
        )}

        {!rol && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `nav-link px-3 py-2 d-block ${isActive ? 'active fw-semibold' : ''}`
            }
          >
            Login
          </NavLink>
        )}
      </CSidebarNav>
    </CSidebar>
  )
}

export default Sidebar