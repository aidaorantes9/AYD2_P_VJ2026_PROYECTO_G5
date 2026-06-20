import { CFooter } from '@coreui/react'

function Footer() {
  return (
    <CFooter className="d-flex justify-content-between">
      <span className="ms-1">PRCCD &copy; {new Date().getFullYear()} — SICA</span>
      <span className="me-1 text-muted">AYD2 — Grupo 5</span>
    </CFooter>
  )
}

export default Footer