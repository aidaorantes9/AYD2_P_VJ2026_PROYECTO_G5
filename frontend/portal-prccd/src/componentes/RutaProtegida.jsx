import { Navigate } from 'react-router-dom'

/**
 * Protege una ruta verificando sesiion y rol.
 * 
 *   <RutaProtegida roles={['admin']}>
 *     <Dashboard />
 *   </RutaProtegida>
 * 
 * Si no hay sesion  → redirige a /login
 * Si no tiene rol   → redirige a /
 */

function RutaProtegida({ children, roles = [] }) {
  let sesion = null

  try {
    sesion = JSON.parse(sessionStorage.getItem('sesion'))
  } catch {
    sesion = null
  }

  if (!sesion?.autenticado) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(sesion.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RutaProtegida