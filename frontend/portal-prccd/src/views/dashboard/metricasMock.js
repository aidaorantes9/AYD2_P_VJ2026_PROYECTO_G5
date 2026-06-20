export const mockMetricas = {
  anonimizada: true,
  fecha_calculo: '2026-06-19',
  metricas: [
    {
      id_pais: 1,
      pais: 'Guatemala',
      carrera_segmento: 'Ingenieria en Sistemas',
      genero_segmento: 'F',
      total_evaluaciones: 120,
      total_aprobados: 95,
      tasa_aprobacion: 79.16,
    },
  ],
  kpis: {
    evaluaciones_realizadas: 18420,
    certificados_emitidos: 13765,
    cumplimiento_sla: 99.7,
    alertas_fraude_pct: 1.8,
  },
  evaluaciones_por_pais: [
    { pais: 'GT', total: 4800 },
    { pais: 'CR', total: 4100 },
    { pais: 'SV', total: 3600 },
    { pais: 'HN', total: 3100 },
    { pais: 'PA', total: 2400 },
  ],
  tendencia_alertas_fraude: [
    { mes: 'Ene', alertas: 1.1 },
    { mes: 'Feb', alertas: 1.3 },
    { mes: 'Mar', alertas: 1.0 },
    { mes: 'Abr', alertas: 2.1 },
    { mes: 'May', alertas: 1.9 },
    { mes: 'Jun', alertas: 2.6 },
  ],
}

export async function fetchMetricas(filtros = {}) {
  return Promise.resolve(mockMetricas)
}