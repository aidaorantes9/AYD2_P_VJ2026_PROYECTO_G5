import { useState, useEffect, useRef } from 'react';
import {
  CCard, CCardBody, CProgress, CBadge,
  CFormCheck, CButton
} from '@coreui/react';

const TOTAL_PREGUNTAS    = 10; // Acuerdo 6 — constante configurable
const ID_CANDIDATO       = 1;  // Acuerdo 1 — Ana López
const TIEMPO_TOTAL_SEG   = 30 * 60; // 30 minutos, ajustable

export default function Examen() {
  const [preguntas,    setPreguntas]    = useState([]);
  const [actual,       setActual]       = useState(0);
  const [respuestas,   setRespuestas]   = useState({});
  const [terminado,    setTerminado]    = useState(false);
  const [resultado,    setResultado]    = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [idEvaluacion, setIdEvaluacion] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TOTAL_SEG);

  const tiempoInicioPregunta = useRef(Date.now());

  // Carga las preguntas al montar el componente
  useEffect(() => {
    fetch(`http://localhost:4001/api/evaluacion/${ID_CANDIDATO}/preguntas`)
      .then(r => r.json())
      .then(data => {
        setPreguntas(data.preguntas || []);
        setCargando(false);
        setIdEvaluacion(1);
      })
      .catch(() => setCargando(false));
  }, []);

  // Timer regresivo
  useEffect(() => {
    if (terminado || cargando) return;
    if (tiempoRestante <= 0) {
      enviarRespuestas();
      return;
    }
    const intervalo = setInterval(() => {
      setTiempoRestante(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [tiempoRestante, terminado, cargando]);

  const preguntaActual = preguntas[actual];
  const progreso        = ((actual + 1) / TOTAL_PREGUNTAS) * 100;

  function formatearTiempo(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function seleccionarOpcion(id_opcion) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id_pregunta]: id_opcion }));
  }

  function anterior() {
    if (actual > 0) {
      setActual(prev => prev - 1);
      tiempoInicioPregunta.current = Date.now();
    }
  }

  function siguiente() {
    if (actual < preguntas.length - 1) {
      setActual(prev => prev + 1);
      tiempoInicioPregunta.current = Date.now();
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

  // ── Datos simulados de monitoreo (placeholder de Allan — CDU100/CDU103) ──
  // TODO: reemplazar con GET /api/metricas o endpoint antifraude real de Allan
  const monitoreoSimulado = {
    camara: 'Estado: activo y autorizado',
    tecleo:  'Evidencia almacenada',
    fraude:  'Sin alertas críticas',
  };

  return (
    <div className="d-flex gap-3 m-4">
      <CCard className="flex-grow-1">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="fw-bold">Candidato:</span> Ana López
            </div>
            <div className="d-flex gap-2">
              <CBadge color="info">Progreso: {actual + 1} de {TOTAL_PREGUNTAS}</CBadge>
              <CBadge color={tiempoRestante < 60 ? 'danger' : 'warning'}>
                Tiempo restante: {formatearTiempo(tiempoRestante)}
              </CBadge>
              <CBadge color="primary">Dificultad: {preguntaActual.nivel_dificultad}</CBadge>
            </div>
          </div>

          <CProgress value={progreso} className="mb-4" />

          <h5 className="mb-4">Pregunta {actual + 1}</h5>
          <p className="mb-3">{preguntaActual.enunciado}</p>

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

          <div className="d-flex gap-2 mt-4">
            <CButton color="secondary" variant="outline" onClick={anterior} disabled={actual === 0}>
              Anterior
            </CButton>
            <CButton
              color="primary"
              disabled={!respuestas[preguntaActual.id_pregunta]}
              onClick={siguiente}
            >
              {actual < preguntas.length - 1 ? 'Guardar y continuar' : 'Finalizar examen'}
            </CButton>
            <CButton color="danger" variant="outline" className="ms-auto" onClick={enviarRespuestas}>
              Finalizar examen
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      <CCard style={{ minWidth: '260px', maxWidth: '260px' }}>
        <CCardBody>
          <h6 className="mb-3">Monitoreo de integridad</h6>

          <div className="mb-3">
            <CBadge color="success" className="mb-1">Cámara y sesión</CBadge>
            <p className="small text-muted mb-0">{monitoreoSimulado.camara}</p>
          </div>

          <div className="mb-3">
            <CBadge color="success" className="mb-1">Registro de tecleo</CBadge>
            <p className="small text-muted mb-0">{monitoreoSimulado.tecleo}</p>
          </div>

          <div className="mb-3">
            <CBadge color="warning" className="mb-1">Análisis antifraude</CBadge>
            <p className="small text-muted mb-0">{monitoreoSimulado.fraude}</p>
          </div>

          <p className="small text-muted mt-3 mb-0">
            Datos simulados — pendiente integración con módulo Antifraude.
          </p>
        </CCardBody>
      </CCard>
    </div>
  );
}