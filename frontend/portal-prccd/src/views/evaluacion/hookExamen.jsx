import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_EVALUACIONES_API_URL || 'http://136.114.93.149:4001';
const CERTIFICACION_API_BASE = import.meta.env.VITE_CERTIFICACION_API_URL || 'http://136.114.93.149:4003';
const TOTAL_PREGUNTAS = 10;
const TIEMPO_TOTAL_SEG = 30 * 60;

function obtenerSesionActual() {
  try {
    return JSON.parse(sessionStorage.getItem('sesion'));
  } catch {
    return null;
  }
}

export function useExamen(navigate) {
  const sesion = obtenerSesionActual();
  const ID_CANDIDATO = Number(sesion?.idCandidato);
  const NOMBRE_CANDIDATO = sesion?.nombre || 'Candidato';
  const UNIVERSIDAD_CANDIDATO = sesion?.universidad || 'Universidad no especificada';

  // Estados
  const [idEvaluacion, setIdEvaluacion] = useState(null);
  const [pregunta, setPregunta] = useState(null);
  const [numeroPregunta, setNumeroPregunta] = useState(1);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [terminado, setTerminado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [emitiendoCertificado, setEmitiendoCertificado] = useState(false);
  const [error, setError] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TOTAL_SEG);
  const [estadoMonitoreo, setEstadoMonitoreo] = useState('pendiente');
  const [monitoreoIniciado, setMonitoreoIniciado] = useState(false);

  const tiempoInicioPregunta = useRef(Date.now());
  const finalizando = useRef(false);
  const intervaloRef = useRef(null);

  const monitoreoActivo = estadoMonitoreo === 'activo';

  // --- Manejador de monitoreo ---
  const manejarEstadoMonitoreo = useCallback((nuevoEstado) => {
    setEstadoMonitoreo(nuevoEstado);
    if (nuevoEstado === 'activo') {
      setMonitoreoIniciado(true);
      setError('');
    }
  }, []);

  // --- Iniciar evaluación ---
  useEffect(() => {
    async function iniciarEvaluacion() {
      try {
        setError('');
        if (!ID_CANDIDATO) {
          throw new Error('No se encontró un candidato válido en la sesión actual');
        }

        const resp = await fetch(`${API_BASE}/api/evaluacion/${ID_CANDIDATO}/iniciar`, {
          method: 'POST',
        });
        const datos = await resp.json();

        if (!resp.ok) {
          throw new Error(datos.error || 'No se pudo iniciar la evaluación');
        }

        setIdEvaluacion(datos.id_evaluacion);
        setPregunta(datos.pregunta);
        setNumeroPregunta(datos.numero_pregunta);
        tiempoInicioPregunta.current = Date.now();
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    iniciarEvaluacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Emitir certificado ---
  const emitirCertificadoAutomaticamente = useCallback(
    async (resultadoEvaluacion) => {
      if (!resultadoEvaluacion?.id_evaluacion || emitiendoCertificado) return false;

      setEmitiendoCertificado(true);
      setError('');

      try {
        const respEmision = await fetch(`${CERTIFICACION_API_BASE}/api/certificados/emitir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_candidato: ID_CANDIDATO,
            id_evaluacion: resultadoEvaluacion.id_evaluacion,
            actor: 'Sistema PRCCD',
            datos_certificado: {
              nombre_candidato: NOMBRE_CANDIDATO,
              universidad: UNIVERSIDAD_CANDIDATO,
            },
          }),
        });
        const datosEmision = await respEmision.json();

        if (!respEmision.ok) {
          throw new Error(datosEmision.error || 'No se pudo emitir el certificado');
        }

        const codigo = datosEmision?.certificado?.codigo_verificacion;
        if (!codigo) {
          throw new Error('La emisión no devolvió un código de verificación');
        }

        const respVerificacion = await fetch(
          `${CERTIFICACION_API_BASE}/api/auditoria/verificar/${encodeURIComponent(codigo)}`
        );
        const datosVerificacion = await respVerificacion.json();

        if (!respVerificacion.ok || !datosVerificacion.valido) {
          throw new Error(
            datosVerificacion.error || datosVerificacion.mensaje || 'El certificado no pudo verificarse'
          );
        }

        navigate('/certificado', {
          replace: true,
          state: { resultado: datosVerificacion },
        });

        return true;
      } catch (err) {
        setError(err.message || 'No se pudo generar el certificado');
        return false;
      } finally {
        setEmitiendoCertificado(false);
      }
    },
    [navigate, emitiendoCertificado, ID_CANDIDATO, NOMBRE_CANDIDATO, UNIVERSIDAD_CANDIDATO]
  );

  // --- Finalizar evaluación ---
  const finalizarEvaluacion = useCallback(async () => {
    if (!idEvaluacion || terminado || finalizando.current) return;

    finalizando.current = true;
    setEnviando(true);
    setError('');

    try {
      const resp = await fetch(`${API_BASE}/api/evaluacion/${ID_CANDIDATO}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_evaluacion: idEvaluacion }),
      });
      const datos = await resp.json();

      if (!resp.ok) {
        throw new Error(datos.error || 'No se pudo finalizar la evaluación');
      }

      setResultado(datos);
      setTerminado(true);

      if (datos.aprobada) {
        await emitirCertificadoAutomaticamente(datos);
      }
    } catch (err) {
      setError(err.message);
      finalizando.current = false;
    } finally {
      setEnviando(false);
    }
  }, [idEvaluacion, terminado, emitirCertificadoAutomaticamente, ID_CANDIDATO]);

  // --- Temporizador ---
  useEffect(() => {
    if (cargando || terminado || !idEvaluacion || !monitoreoIniciado || tiempoRestante <= 0) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      return;
    }

    intervaloRef.current = setInterval(() => {
      setTiempoRestante((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [cargando, terminado, idEvaluacion, monitoreoIniciado, tiempoRestante]);

  // --- Finalizar automáticamente al llegar a 0 ---
  useEffect(() => {
    if (tiempoRestante === 0 && idEvaluacion && !terminado && monitoreoIniciado) {
      finalizarEvaluacion();
    }
  }, [tiempoRestante, idEvaluacion, terminado, monitoreoIniciado, finalizarEvaluacion]);

  // --- Responder pregunta ---
  const responderPregunta = useCallback(async (opcionPorVoz = null) => {
    if (!monitoreoActivo) {
      setError('Debe activar el monitoreo antes de responder la evaluación.');
      return;
    }

    // Si React manda el evento del botón, se ignora.
    // Solo se acepta opcionPorVoz cuando es un id numérico/string.
    const opcionValidaPorVoz =
      typeof opcionPorVoz === 'number' ||
      typeof opcionPorVoz === 'string';

    const opcionFinal = opcionValidaPorVoz
      ? opcionPorVoz
      : opcionSeleccionada;

    if (!opcionFinal || !pregunta || enviando) return;

    setEnviando(true);
    setError('');

    try {
      const tiempoRespuesta = Date.now() - tiempoInicioPregunta.current;

      const resp = await fetch(`${API_BASE}/api/evaluacion/respuesta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_candidato: ID_CANDIDATO,
          id_evaluacion: idEvaluacion,
          id_pregunta: pregunta.id_pregunta,
          id_opcion_seleccionada: opcionFinal,
          tiempo_respuesta_ms: tiempoRespuesta,
        }),
      });
      const datos = await resp.json();

      if (!resp.ok) {
        throw new Error(datos.error || 'No se pudo registrar la respuesta');
      }

      if (datos.terminado) {
        const resultadoFinal = datos.resultado || datos;
        setResultado(resultadoFinal);
        setTerminado(true);
        if (resultadoFinal.aprobada) {
          await emitirCertificadoAutomaticamente(resultadoFinal);
        }
        return;
      }

      setPregunta(datos.siguiente_pregunta);
      setNumeroPregunta(datos.numero_pregunta);
      setOpcionSeleccionada(null);
      tiempoInicioPregunta.current = Date.now();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }, [
    monitoreoActivo,
    opcionSeleccionada,
    pregunta,
    enviando,
    idEvaluacion,
    ID_CANDIDATO,
    emitirCertificadoAutomaticamente,
  ]);

  // --- Resultado de voz ---
  const manejarResultadoVoz = useCallback(
    async (resultadoVoz) => {
      const idOpcionDetectada =
        resultadoVoz?.opcion_detectada?.id_opcion;

      if (!idOpcionDetectada) {
        setError(
          'La voz fue transcrita, pero no se pudo asociar con una opción de respuesta.'
        );
        return;
      }

      setOpcionSeleccionada(idOpcionDetectada);

      await responderPregunta(idOpcionDetectada);
    },
    [responderPregunta]
  );

  // --- Formatear tiempo ---
  const formatearTiempo = useCallback((segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
    NOMBRE_CANDIDATO,
    API_BASE,
  };
}