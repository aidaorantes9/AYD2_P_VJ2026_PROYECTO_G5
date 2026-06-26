const API_BASE =
  import.meta.env.VITE_ANTIFRAUDE_API_URL ||
  'http://136.114.93.149:4004'

export async function fetchMetricas(
  filtros = {}
) {
  const parametros =
    new URLSearchParams()

  if (
    filtros.pais &&
    filtros.pais !== 'Todos'
  ) {
    parametros.set(
      'pais',
      filtros.pais
    )
  }

  if (
    filtros.carrera &&
    filtros.carrera !== 'Todas'
  ) {
    parametros.set(
      'carrera',
      filtros.carrera
    )
  }

  if (
    filtros.genero &&
    filtros.genero !== 'Todos'
  ) {
    parametros.set(
      'genero',
      filtros.genero
    )
  }

  if (
    filtros.anio &&
    filtros.anio !== 'Todos'
  ) {
    parametros.set(
      'anio',
      filtros.anio
    )
  }

  const query =
    parametros.toString()

  const url = query
    ? `${API_BASE}/api/metricas?${query}`
    : `${API_BASE}/api/metricas`

  const respuesta =
    await fetch(url)

  const datos =
    await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.message ||
      datos.error ||
      'No fue posible consultar las métricas'
    )
  }

  if (
    datos.anonimizada !== true
  ) {
    throw new Error(
      'El servicio respondió con datos no anonimizados'
    )
  }

  return datos
}
