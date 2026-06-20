import { NavLink } from 'react-router-dom'
import { CSidebar, CSidebarNav, CNavTitle } from '@coreui/react'

const items = [
  { label: 'Inicio', to: '/' },
  { label: 'Certificados y Auditoría', to: '/certificado' },
  { label: 'Privacidad', to: '/privacidad' },
]

function Sidebar() {
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
      </CSidebarNav>
    </CSidebar>
  )
}

export default Sidebar