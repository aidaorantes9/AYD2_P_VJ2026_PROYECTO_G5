import { useEffect, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CButton,
  CBadge,
} from '@coreui/react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { fetchMetricas } from './metricasMock'

function KpiCard({ titulo, valor, color }) {
  return (
    <CCard className="text-center h-100" style={{ borderTop: `3px solid var(--cui-${color})` }}>
      <CCardBody>
        <div className={`small fw-semibold text-${color} mb-1`}>{titulo}</div>
        <div className={`fs-3 fw-bold text-${color}`}>{valor}</div>
      </CCardBody>
    </CCard>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [filtros, setFiltros] = useState({ pais: 'Todos', carrera: 'Todas', genero: 'Todos', anio: '2026' })

  const cargarMetricas = () => {
    fetchMetricas(filtros).then(setData)
  }

  useEffect(() => {
    cargarMetricas()
  }, [])

  if (!data) {
    return (
      <CContainer className="py-4">
        <p className="text-muted">Cargando métricas...</p>
      </CContainer>
    )
  }

  const { kpis, evaluaciones_por_pais, tendencia_alertas_fraude } = data

  return (
    <CContainer fluid className="py-4">
      <CCard className="mb-3">
        <CCardBody className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h4 className="mb-1">Dashboard Regional de Competencias</h4>
            <div className="text-muted small">
              Métricas agregadas y anonimizadas para la toma de decisiones.
            </div>
          </div>
          <CBadge color="light" className="border text-body px-2 py-1">
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
                onChange={(e) => setFiltros({ ...filtros, pais: e.target.value })}
                options={['Todos', 'Guatemala', 'Costa Rica', 'El Salvador', 'Honduras', 'Panamá']}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                label="Carrera"
                value={filtros.carrera}
                onChange={(e) => setFiltros({ ...filtros, carrera: e.target.value })}
                options={['Todas', 'Ingeniería en Sistemas', 'Administración']}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                label="Género"
                value={filtros.genero}
                onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}
                options={['Todos', 'F', 'M']}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                label="Año"
                value={filtros.anio}
                onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}
                options={['2026', '2025', '2024']}
              />
            </CCol>
            <CCol md={4} className="text-md-end">
              <CButton color="primary" onClick={cargarMetricas}>
                Aplicar filtros
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <CRow className="g-3 mb-3">
        <CCol md={3}>
          <KpiCard
            titulo="Evaluaciones realizadas"
            valor={kpis.evaluaciones_realizadas.toLocaleString('es-GT')}
            color="primary"
          />
        </CCol>
        <CCol md={3}>
          <KpiCard
            titulo="Certificados emitidos"
            valor={kpis.certificados_emitidos.toLocaleString('es-GT')}
            color="success"
          />
        </CCol>
        <CCol md={3}>
          <KpiCard titulo="Cumplimiento SLA" valor={`${kpis.cumplimiento_sla} %`} color="info" />
        </CCol>
        <CCol md={3}>
          <KpiCard titulo="Alertas de fraude" valor={`${kpis.alertas_fraude_pct} %`} color="warning" />
        </CCol>
      </CRow>

      <CRow className="g-3 mb-3">
        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Competencias por país</CCardHeader>
            <CCardBody>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={evaluaciones_por_pais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pais" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#a8c5fa" />
                </BarChart>
              </ResponsiveContainer>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Tendencia de alertas antifraude</CCardHeader>
            <CCardBody>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={tendencia_alertas_fraude}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="alertas" stroke="#cc6633" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <div className="text-center text-muted small mt-4">
        Datos agregados y anonimizados antes de su presentación. No se muestran registros personales de candidatos.
      </div>
    </CContainer>
  )
}

export default Dashboard