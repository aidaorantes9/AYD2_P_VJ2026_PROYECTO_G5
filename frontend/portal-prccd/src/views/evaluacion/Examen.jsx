import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CAlert,
  CCard,
  CCardBody,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react';

import MonitoreoAntifraude from '../antifraude/MonitoreoAntifraude';
import BotonAudio from './BotonAudio';
import { useExamen } from './hookExamen';
import {
  CabeceraExamen,
  OpcionesPregunta,
  ControlesExamen,
  ResultadoExamen,
} from './ComponentesExamen';

const TOTAL_PREGUNTAS = 10;

export default function Examen() {
  const navigate = useNavigate();

  const {
    idEvaluacion,
    pregunta,
    numeroPregunta,
    opcionSeleccionada,
    setOpcionSeleccionada,
    resultado,
    terminado,
    cargando,
    enviando,
    emitiendoCertificado,
    error,
    tiempoRestante,
    estadoMonitoreo,
    monitoreoIniciado,
    monitoreoActivo,
    manejarEstadoMonitoreo,
    responderPregunta,
    finalizarEvaluacion,
    emitirCertificadoAutomaticamente,
    manejarResultadoVoz,
    formatearTiempo,
    ID_CANDIDATO,
    API_BASE,
  } = useExamen(navigate);

  const progreso = useMemo(
    () => (numeroPregunta / TOTAL_PREGUNTAS) * 100,
    [numeroPregunta]
  );

  // --- Estados de carga y error ---
  if (cargando) {
    return (
      <CCard className="m-4">
        <CCardBody className="text-center">
          <CSpinner />
          <p className="mt-2 mb-0">Iniciando examen adaptativo...</p>
        </CCardBody>
      </CCard>
    );
  }

  if (error && !pregunta) {
    return <CAlert color="danger" className="m-4">{error}</CAlert>;
  }

  if (!pregunta && !terminado) {
    return (
      <CAlert color="warning" className="m-4">
        No hay preguntas disponibles.
      </CAlert>
    );
  }

  // --- Resultado final ---
  if (terminado && resultado) {
    return (
      <ResultadoExamen
        resultado={resultado}
        emitiendoCertificado={emitiendoCertificado}
        error={error}
        onEmitirCertificado={emitirCertificadoAutomaticamente}
      />
    );
  }

  // --- Examen activo ---
  return (
    <CRow className="g-3 m-4">
      {/* Monitoreo */}
      <CCol xs={12} md={12} lg={3}>
        <MonitoreoAntifraude
          idEvaluacion={idEvaluacion}
          numeroPregunta={numeroPregunta}
          onEstadoChange={manejarEstadoMonitoreo}
        />
      </CCol>

      {/* Tarjeta del examen */}
      <CCol xs={12} md={12} lg={9}>
        <CCard>
          <CCardBody>
            <CabeceraExamen
              nombreCandidato={/* desde sesión */ 'Candidato'} // Se puede pasar desde useExamen
              numeroPregunta={numeroPregunta}
              totalPreguntas={TOTAL_PREGUNTAS}
              tiempoRestante={tiempoRestante}
              nivelDificultad={pregunta?.nivel_dificultad}
              formatearTiempo={formatearTiempo}
              progreso={progreso}
            />

            <h5 className="mb-4">Pregunta {numeroPregunta}</h5>
            <p className="mb-3">{pregunta.enunciado}</p>

            {/* Alerta de monitoreo inactivo */}
            {!monitoreoActivo && (
              <CAlert
                color={
                  estadoMonitoreo === 'detenido' || estadoMonitoreo === 'error'
                    ? 'danger'
                    : 'warning'
                }
              >
                <strong>Monitoreo obligatorio.</strong>{' '}
                {monitoreoIniciado
                  ? 'El monitoreo fue interrumpido. Reactívelo para continuar. El tiempo continúa avanzando.'
                  : 'Active el monitoreo y autorice compartir la pantalla para comenzar la evaluación.'}
              </CAlert>
            )}

            {/* Opciones */}
            <OpcionesPregunta
              opciones={pregunta.opciones || []}
              opcionSeleccionada={opcionSeleccionada}
              onSeleccionar={setOpcionSeleccionada}
              disabled={enviando || !monitoreoActivo}
            />



            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            <ControlesExamen
              enviando={enviando}
              opcionSeleccionada={opcionSeleccionada}
              monitoreoActivo={monitoreoActivo}
              numeroPregunta={numeroPregunta}
              totalPreguntas={TOTAL_PREGUNTAS}
              emitiendoCertificado={emitiendoCertificado}
              onResponder={responderPregunta}
              onFinalizar={finalizarEvaluacion}
            >
              <BotonAudio
                idCandidato={ID_CANDIDATO}
                idEvaluacion={idEvaluacion}
                idPregunta={pregunta.id_pregunta}
                apiBase={API_BASE}
                onResultado={manejarResultadoVoz}
                disabled={enviando || !monitoreoActivo}
              />
            </ControlesExamen>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}