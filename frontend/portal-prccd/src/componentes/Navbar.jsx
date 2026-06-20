import { CHeader, CHeaderBrand, CHeaderNav, CNavItem, CContainer } from '@coreui/react'

function Navbar() {
  return (
    <CHeader position="sticky" className="mb-0">
      <CContainer fluid>
        <CHeaderBrand className="fw-bold">
          PRCCD — Plataforma Regional de Certificación de Competencias Digitales
        </CHeaderBrand>
        <CHeaderNav className="ms-auto">
          <CNavItem className="text-muted small px-2">Grupo 5 — Fase 2</CNavItem>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default Navbar