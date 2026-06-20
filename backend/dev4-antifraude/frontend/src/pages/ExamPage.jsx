import {
    CButton,
    CCard,
    CCardBody,
    CFormInput,
    CFormTextarea
  } from '@coreui/react'
  
  function ExamPage() {
    return (
      <div className="container mt-5">
        <CCard>
          <CCardBody>
            <h2>Examen Antifraude</h2>
  
            <br />
  
            <CFormInput
              label="Nombre"
              placeholder="Ingrese su nombre"
            />
  
            <br />
  
            <CFormTextarea
              label="Respuesta"
              rows={5}
              placeholder="Escriba su respuesta"
            />
  
            <br />
  
            <CButton color="primary">
              Enviar
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    )
  }
  
  export default ExamPage