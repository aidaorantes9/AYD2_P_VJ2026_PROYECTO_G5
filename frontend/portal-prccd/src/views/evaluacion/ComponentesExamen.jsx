import {
  CBadge,
  CProgress,
  CFormCheck,
  CButton,
  CCard,
  CCardBody,
  CSpinner,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react';

export const CabeceraExamen = ({
  nombreCandidato,
  numeroPregunta,
  totalPreguntas,
  tiempoRestante,
  nivelDificultad,
  formatearTiempo,
  progreso,
}) => (
  <>
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <div>
        <span className="fw-bold">Candidato:</span> {nombreCandidato}
      </div>
      <div className="d-flex flex-wrap gap-2">
        <CBadge color="info">
          Progreso: {numeroPregunta} de {totalPreguntas}
        </CBadge>
        <CBadge color={tiempoRestante < 60 ? 'danger' : 'warning'}>
          Tiempo restante: {formatearTiempo(tiempoRestante)}
        </CBadge>
        <CBadge color="primary">Dificultad: {nivelDificultad}</CBadge>
      </div>
    </div>
    <CProgress value={progreso} className="mb-4" />
  </>
);

export const OpcionesPregunta = ({
  opciones,
  opcionSeleccionada,
  onSeleccionar,
  disabled,
}) => (
  <>
    {opciones.map((opcion) => (
      <CFormCheck
        key={opcion.id_opcion}
        type="radio"
        name="opcion"
        id={`opcion-${opcion.id_opcion}`}
        label={opcion.texto_opcion}
        checked={opcionSeleccionada === opcion.id_opcion}
        onChange={() => onSeleccionar(opcion.id_opcion)}
        disabled={disabled}
        className="mb-2"
      />
    ))}
  </>
);

export const ControlesExamen = ({
  enviando,
  opcionSeleccionada,
  monitoreoActivo,
  numeroPregunta,
  totalPreguntas,
  emitiendoCertificado,
  onResponder,
  onFinalizar,
  children, // BotonAudio
}) => (
  <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
    {/* Botón principal */}
    <CButton
      color="primary"
      disabled={!opcionSeleccionada || enviando || !monitoreoActivo}
      onClick={onResponder}
    >
      {enviando ? (
        <>
          <CSpinner size="sm" className="me-2" />
          Guardando...
        </>
      ) : numeroPregunta < totalPreguntas ? (
        'Guardar y continuar'
      ) : (
        'Finalizar examen'
      )}
    </CButton>

    {/* Botón de audio (children) */}
    {children}

    {/* Botón "Finalizar ahora" alineado a la derecha */}
    <CButton
      color="danger"
      variant="outline"
      className="ms-lg-auto"
      disabled={enviando || emitiendoCertificado || !monitoreoActivo}
      onClick={onFinalizar}
    >
      Finalizar ahora
    </CButton>
  </div>
);

export const ResultadoExamen = ({
  resultado,
  emitiendoCertificado,
  error,
  onEmitirCertificado,
}) => (
  <CRow className="m-4">
    <CCol xs={12} md={8} lg={6}>
      <CCard>
        <CCardBody>
          <h4>Resultado del examen</h4>
          <CBadge color={resultado.aprobada ? 'success' : 'danger'} className="mb-3">
            {resultado.aprobada ? 'Aprobado' : 'Reprobado'}
          </CBadge>
          <p>
            Calificación: <strong>{Number(resultado.calificacion).toFixed(2)}</strong> / 100
          </p>
          <p>
            Correctas: {resultado.correctas} de {resultado.total}
          </p>
          {resultado.respondidas !== undefined && (
            <p>Preguntas respondidas: {resultado.respondidas}</p>
          )}
          {emitiendoCertificado && (
            <CAlert color="info">
              <CSpinner size="sm" className="me-2" />
              Emitiendo y verificando su certificado...
            </CAlert>
          )}
          {error && <CAlert color="danger">{error}</CAlert>}
          {resultado.aprobada && (
            <CButton
              color="success"
              disabled={emitiendoCertificado}
              onClick={() => onEmitirCertificado(resultado)}
            >
              {emitiendoCertificado ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Generando certificado...
                </>
              ) : (
                'Obtener certificado'
              )}
            </CButton>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
);