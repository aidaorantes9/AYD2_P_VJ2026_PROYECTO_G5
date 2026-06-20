
import { useState, useEffect } from 'react';
import {
  CCard, CCardBody, CProgress, CBadge,
  CFormCheck, CButton
} from '@coreui/react';

const TOTAL_PREGUNTAS = 10;
const ID_CANDIDATO    = 1; // Acuerdo 1 — Ana López

export default function Examen() {
  const [preguntas,    setPreguntas]    = useState([]);
  const [actual,       setActual]       = useState(0);
  const [respuestas,   setRespuestas]   = useState({});
  const [terminado,    setTerminado]    = useState(false);
  const [resultado,    setResultado]    = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [idEvaluacion, setIdEvaluacion] = useState(null);

  // Carga las preguntas al montar el componente
  useEffect(() => {
    fetch(`http://localhost:4001/api/evaluacion/${ID_CANDIDATO}/preguntas`)
      .then(r => r.json())
      .then(data => {
        setPreguntas(data.preguntas || []);
        setCargando(false);
        // Crea el registro de evaluación (en un proyecto real vendría del login)
        setIdEvaluacion(1);
      })
      .catch(() => setCargando(false));
  }, []);

  const preguntaActual = preguntas[actual];
  const progreso       = ((actual + 1) / TOTAL_PREGUNTAS) * 100;

  function seleccionarOpcion(id_opcion) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id_pregunta]: id_opcion }));
  }

  function siguiente() {
    if (actual < preguntas.length - 1) {
      setActual(prev => prev + 1);
    } else {
      enviarRespuestas();
    }
  }

  function enviarRespuestas() {
    const body = {
      id_evaluacion: idEvaluacion,
      respuestas: preguntas.map((p, i) => ({
        id_pregunta:            p.id_pregunta,
        id_opcion_seleccionada: respuestas[p.id_pregunta] || null,
        tiempo_respuesta_ms:    null,
        orden_secuencia:        i + 1,
      })),
    };

    fetch(`http://localhost:4001/api/evaluacion/${ID_CANDIDATO}/responder`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        setResultado(data);
        setTerminado(true);
      });
  }

  // ── Pantalla de carga ──
  if (cargando) {
    return (
      <CCard className="m-4">
        <CCardBody>
          <p>Cargando examen...</p>
        </CCardBody>
      </CCard>
    );
  }

  // ── Pantalla de resultado ──
  if (terminado && resultado) {
    return (
      <CCard className="m-4">
        <CCardBody>
          <h4>Resultado del examen</h4>
          <CBadge color={resultado.aprobada ? 'success' : 'danger'} className="mb-3">
            {resultado.aprobada ? 'Aprobado' : 'Reprobado'}
          </CBadge>
          <p>Calificación: <strong>{resultado.calificacion.toFixed(2)}</strong> / 100</p>
          <p>Correctas: {resultado.correctas} de {resultado.total}</p>
        </CCardBody>
      </CCard>
    );
  }

  // ── Pantalla del examen ──
  if (!preguntaActual) return <p>No hay preguntas disponibles.</p>;

  return (
    <CCard className="m-4">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Pregunta {actual + 1} de {TOTAL_PREGUNTAS}</span>
          <CBadge color="info">{preguntaActual.nivel_dificultad}</CBadge>
        </div>

        <CProgress value={progreso} className="mb-4" />

        <h5 className="mb-4">{preguntaActual.enunciado}</h5>

        {(preguntaActual.opciones || []).map(opcion => (
          <CFormCheck
            key={opcion.id_opcion}
            type="radio"
            name="opcion"
            id={`opcion-${opcion.id_opcion}`}
            label={opcion.texto_opcion}
            checked={respuestas[preguntaActual.id_pregunta] === opcion.id_opcion}
            onChange={() => seleccionarOpcion(opcion.id_opcion)}
            className="mb-2"
          />
        ))}

        <CButton
          color="primary"
          className="mt-4"
          disabled={!respuestas[preguntaActual.id_pregunta]}
          onClick={siguiente}
        >
          {actual < preguntas.length - 1 ? 'Siguiente' : 'Terminar examen'}
        </CButton>
      </CCardBody>
    </CCard>
  );
}