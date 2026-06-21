import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  fetchMetricas,
} from './metricasMock'

const FILTROS_INICIALES = {
  pais: 'Todos',
  carrera: 'Todas',
  genero: 'Todos',
  anio: 'Todos',
}

const NOMBRES_MESES = [
  '',
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function KpiCard({
  titulo,
  valor,
  color,
}) {
  return (
    <CCard
      className="text-center h-100"
      style={{
        borderTop:
          `3px solid var(--cui-${color})`,
      }}
    >
      <CCardBody>
        <div
          className={
            `small fw-semibold text-${color} mb-1`
          }
        >
          {titulo}
        </div>

        <div
          className={
            `fs-3 fw-bold text-${color}`
          }
        >
          {valor}
        </div>
      </CCardBody>
    </CCard>
  )
}

function agruparPorPais(
  metricas = []
) {
  const grupos = new Map()

  for (const metrica of metricas) {
    const codigo =
      metrica.codigo_pais ||
      metrica.pais ||
      'N/D'

    const actual =
      grupos.get(codigo) || {
        pais: codigo,
        total: 0,
      }

    actual.total +=
      Number(
        metrica.total_evaluaciones || 0
      )

    grupos.set(
      codigo,
      actual
    )
  }

  return Array.from(
    grupos.values()
  )
}

function Dashboard() {
  const [data, setData] =
    useState(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [filtros, setFiltros] =
    useState(FILTROS_INICIALES)

  const [opciones, setOpciones] =
    useState({
      paises: [],
      carreras: [],
      generos: [],
      anios: [],
    })

  async function cargarMetricas(
    filtrosConsulta = filtros,
    cargarOpciones = false
  ) {
    setCargando(true)
    setError('')

    try {
      const respuesta =
        await fetchMetricas(
          filtrosConsulta
        )

      setData(respuesta)

      if (
        cargarOpciones ||
        opciones.paises.length === 0
      ) {
        const metricas =
          respuesta.metricas || []

        setOpciones({
          paises: Array.from(
            new Map(
              metricas.map(
                (metrica) => [
                  metrica.codigo_pais,
                  {
                    codigo:
                      metrica.codigo_pais,

                    nombre:
                      metrica.pais,
                  },
                ]
              )
            ).values()
          ).filter(
            (pais) =>
              pais.codigo
          ),

          carreras: [
            ...new Set(
              metricas
                .map(
                  (metrica) =>
                    metrica
                      .carrera_segmento
                )
                .filter(Boolean)
            ),
          ],

          generos: [
            ...new Set(
              metricas
                .map(
                  (metrica) =>
                    metrica
                      .genero_segmento
                )
                .filter(Boolean)
            ),
          ],

          anios:
            respuesta
              .anios_disponibles ||
            [],
        })
      }
    } catch (err) {
      setData(null)

      setError(
        err.message ||
          'No fue posible cargar el dashboard'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarMetricas(
      FILTROS_INICIALES,
      true
    )
  }, [])

  const evaluacionesPorPais =
    useMemo(
      () =>
        agruparPorPais(
          data?.metricas || []
        ),
      [data]
    )

  const tendenciaAlertas =
    useMemo(
      () =>
        (
          data
            ?.tendencia_alertas_fraude ||
          []
        ).map(
          (registro) => ({
            mes:
              NOMBRES_MESES[
                registro.mes
              ] ||
              registro.periodo,

            alertas:
              registro.alertas,
          })
        ),
      [data]
    )

  function actualizarFiltro(
    nombre,
    valor
  ) {
    setFiltros(
      (actuales) => ({
        ...actuales,
        [nombre]: valor,
      })
    )
  }

  function limpiarFiltros() {
    setFiltros(
      FILTROS_INICIALES
    )

    cargarMetricas(
      FILTROS_INICIALES
    )
  }

  const kpis =
    data?.kpis || {
      evaluaciones_realizadas: 0,
      certificados_emitidos: 0,
      tasa_aprobacion: 0,
      alertas_fraude_pct: 0,
    }

  return (
    <CContainer
      fluid
      className="py-4"
    >
      <CCard className="mb-3">
        <CCardBody className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h4 className="mb-1">
              Dashboard Regional de
              Competencias
            </h4>

            <div className="text-muted small">
              Métricas agregadas y
              anonimizadas para la toma de
              decisiones.
            </div>
          </div>

          <CBadge
            color="light"
            className="border text-body px-2 py-1"
          >
            CDU104 | RF22-RF25 | EaC10
          </CBadge>
        </CCardBody>
      </CCard>

      <CCard className="mb-3">
        <CCardBody>
          <CRow className="g-3 align-items-end">
            <CCol md={2}>
              <CFormSelect
                label="País"
                value={filtros.pais}
                onChange={(evento) =>
                  actualizarFiltro(
                    'pais',
                    evento.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos
                </option>

                {opciones.paises.map(
                  (pais) => (
                    <option
                      key={pais.codigo}
                      value={pais.codigo}
                    >
                      {pais.nombre}
                    </option>
                  )
                )}
              </CFormSelect>
            </CCol>

            <CCol md={2}>
              <CFormSelect
                label="Carrera"
                value={filtros.carrera}
                onChange={(evento) =>
                  actualizarFiltro(
                    'carrera',
                    evento.target.value
                  )
                }
              >
                <option value="Todas">
                  Todas
                </option>

                {opciones.carreras.map(
                  (carrera) => (
                    <option
                      key={carrera}
                      value={carrera}
                    >
                      {carrera}
                    </option>
                  )
                )}
              </CFormSelect>
            </CCol>

            <CCol md={2}>
              <CFormSelect
                label="Género"
                value={filtros.genero}
                onChange={(evento) =>
                  actualizarFiltro(
                    'genero',
                    evento.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos
                </option>

                {opciones.generos.map(
                  (genero) => (
                    <option
                      key={genero}
                      value={genero}
                    >
                      {genero}
                    </option>
                  )
                )}
              </CFormSelect>
            </CCol>

            <CCol md={2}>
              <CFormSelect
                label="Año"
                value={filtros.anio}
                onChange={(evento) =>
                  actualizarFiltro(
                    'anio',
                    evento.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos
                </option>

                {opciones.anios.map(
                  (anio) => (
                    <option
                      key={anio}
                      value={anio}
                    >
                      {anio}
                    </option>
                  )
                )}
              </CFormSelect>
            </CCol>

            <CCol
              md={4}
              className="text-md-end"
            >
              <div className="d-flex justify-content-md-end gap-2">
                <CButton
                  color="primary"
                  disabled={cargando}
                  onClick={() =>
                    cargarMetricas(
                      filtros
                    )
                  }
                >
                  Aplicar filtros
                </CButton>

                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={cargando}
                  onClick={
                    limpiarFiltros
                  }
                >
                  Limpiar
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {error && (
        <CAlert
          color="danger"
          className="d-flex justify-content-between align-items-center"
        >
          <span>{error}</span>

          <CButton
            color="danger"
            variant="outline"
            size="sm"
            onClick={() =>
              cargarMetricas(
                filtros
              )
            }
          >
            Reintentar
          </CButton>
        </CAlert>
      )}

      {cargando && (
        <div className="text-center py-5">
          <CSpinner />

          <p className="mt-3 text-muted">
            Calculando métricas...
          </p>
        </div>
      )}

      {!cargando &&
        !error &&
        data &&
        data.metricas.length === 0 && (
          <CAlert color="info">
            No existen métricas para los
            filtros seleccionados.
          </CAlert>
        )}

      {!cargando &&
        !error &&
        data &&
        data.metricas.length > 0 && (
          <>
            <CRow className="g-3 mb-3">
              <CCol md={3}>
                <KpiCard
                  titulo="Evaluaciones realizadas"
                  valor={
                    kpis
                      .evaluaciones_realizadas
                      .toLocaleString(
                        'es-GT'
                      )
                  }
                  color="primary"
                />
              </CCol>

              <CCol md={3}>
                <KpiCard
                  titulo="Certificados emitidos"
                  valor={
                    kpis
                      .certificados_emitidos
                      .toLocaleString(
                        'es-GT'
                      )
                  }
                  color="success"
                />
              </CCol>

              <CCol md={3}>
                <KpiCard
                  titulo="Tasa de aprobación"
                  valor={
                    `${kpis.tasa_aprobacion} %`
                  }
                  color="info"
                />
              </CCol>

              <CCol md={3}>
                <KpiCard
                  titulo="Alertas de fraude"
                  valor={
                    `${kpis.alertas_fraude_pct} %`
                  }
                  color="warning"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CCard className="h-100">
                  <CCardHeader className="fw-semibold">
                    Competencias por país
                  </CCardHeader>

                  <CCardBody>
                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <BarChart
                        data={
                          evaluacionesPorPais
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="pais"
                        />

                        <YAxis
                          allowDecimals={
                            false
                          }
                        />

                        <Tooltip />

                        <Bar
                          dataKey="total"
                          name="Evaluaciones"
                          fill="#a8c5fa"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={6}>
                <CCard className="h-100">
                  <CCardHeader className="fw-semibold">
                    Tendencia de alertas
                    antifraude
                  </CCardHeader>

                  <CCardBody>
                    {tendenciaAlertas.length >
                    0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height={260}
                      >
                        <LineChart
                          data={
                            tendenciaAlertas
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                          />

                          <XAxis
                            dataKey="mes"
                          />

                          <YAxis
                            allowDecimals={
                              false
                            }
                          />

                          <Tooltip />

                          <Line
                            type="monotone"
                            dataKey="alertas"
                            name="Alertas"
                            stroke="#cc6633"
                            strokeWidth={2}
                            dot={{
                              r: 4,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">
                        No existen alertas
                        antifraude para los
                        filtros seleccionados.
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <div className="text-center text-muted small mt-4">
              Datos agregados y
              anonimizados antes de su
              presentación. No se muestran
              registros personales de
              candidatos.
            </div>
          </>
        )}
    </CContainer>
  )
}

export default Dashboard
