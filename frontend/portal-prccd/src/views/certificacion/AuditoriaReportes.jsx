import { useState } from 'react'
import { CAlert, CBadge, CButton, CCard, CCardBody, CCol, CContainer, CFormInput, CRow, CSpinner, CTable,
  CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'

const API_BASE = import.meta.env.VITE_CERTIFICACION_API_URL || 'http://localhost:4003'
// DEBE MODIFICARSE POR EL PUERTO DE ALLAN QUE ES 4004

// AQUI DEBE IR PARA CONSUMIR EL BACKEND DE ALLAN, OJO ALLI ESTO SE TIENE QUE CAMBIAR SI O SI 
const ENDPOINT_VERIFICACION = '/api/auditoria/verificar'

function AuditoriaReportes() {
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  function normalizarRespuesta(data) {
    const eventos = data.eventos || []
    const anomalias = data.anomalias || []

    const rastroIntegro =
      eventos.length > 0 &&
      eventos.every(
        (evento) =>
          evento.enlace_valido &&
          evento.hash_valido &&
          evento.firma_valida,
      )

    return {
      codigo_verificacion:
        data.certificado?.codigo_verificacion || codigo,

      firma_valida:
        data.integridad_certificado?.firma_valida ?? false,

      rastro_integro: rastroIntegro,

      alteraciones_detectadas: anomalias.length,

      retencion_evidencia: '5 años',

      eventos,
    }
  }

  async function verificarCertificado() {
    setError('')
    setResultado(null)

    if (!codigo.trim()) {
      setError('Debe ingresar un codigo de certificado.')
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(
        `${API_BASE}${ENDPOINT_VERIFICACION}/${encodeURIComponent(codigo.trim())}`,
      )

      const data = await respuesta.json()

      if (!respuesta.ok || data.ok === false) {
        throw new Error(data.mensaje || 'No se pudo verificar el certificado.')
      }

      const datosNormalizados = normalizarRespuesta(data)

      setResultado(datosNormalizados)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  function exportarReporte() {
    if (!resultado) {
      setError('Primero debe verificar un certificado para exportar el reporte.')
      return
    }

    const reporte = {
      codigo_certificado: resultado.codigo_verificacion,
      fecha_exportacion: new Date().toISOString(),
      firma_valida: resultado.firma_valida,
      rastro_integro: resultado.rastro_integro,
      alteraciones_detectadas: resultado.alteraciones_detectadas,
      retencion_evidencia: resultado.retencion_evidencia,
      eventos: resultado.eventos,
    }

    const archivo = new Blob([JSON.stringify(reporte, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = `reporte-auditoria-${resultado.codigo_verificacion}.json`
    enlace.click()

    URL.revokeObjectURL(url)
  }

  const eventos = resultado?.eventos?.length
    ? resultado.eventos
    : [
        {
          fecha: 'Sin registros',
          evento: 'No hay eventos de auditoria para mostrar',
          actor: '-',
          estado: '-',
        },
      ]

  return (
    <CContainer fluid style={{ padding: '32px' }}>
      <CCard
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          borderRadius: '24px',
          border: '2px solid #374151',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <CCardBody style={{ padding: 0 }}>
          <div
            style={{
              backgroundColor: '#eef2f6',
              borderBottom: '2px solid #374151',
              padding: '14px 22px',
            }}
          >
            <h4 style={{ margin: 0, fontWeight: 700 }}>
              Auditoria y reportes
            </h4>
          </div>

          <div style={{ padding: '20px 34px 34px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <small style={{ color: '#6b7280' }}>
                Consulta de trazabilidad, firmas electronicas y evidencias asociadas.
              </small>

              <CBadge color="primary" style={{ padding: '8px 22px' }}>
                CDU103 | RF17-RF21
              </CBadge>
            </div>

            <CRow className="g-3" style={{ marginBottom: '24px' }}>
              <CCol md={6}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: '14px',
                    marginBottom: '6px',
                  }}
                >
                  Codigo de certificado
                </label>

                <CFormInput
                  value={codigo}
                  placeholder="PRCCD-2026-004582"
                  onChange={(event) => setCodigo(event.target.value)}
                />
              </CCol>

              <CCol md={3} style={{ display: 'flex', alignItems: 'end' }}>
                <CButton
                  color="primary"
                  disabled={cargando}
                  onClick={verificarCertificado}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  {cargando ? <CSpinner size="sm" /> : 'Verificar'}
                </CButton>
              </CCol>

              <CCol md={3} style={{ display: 'flex', alignItems: 'end' }}>
                <CButton
                  color="success"
                  disabled={cargando || !resultado}
                  onClick={exportarReporte}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  Exportar reporte
                </CButton>
              </CCol>
            </CRow>

            {error && (
              <CAlert color="danger">
                <strong>Error:</strong> {error}
              </CAlert>
            )}

            <CRow className="g-4">
              <CCol lg={4}>
                <div
                  style={{
                    border: '2px solid #6b7280',
                    borderRadius: '6px',
                    backgroundColor: '#eef2f6',
                    padding: '10px 12px',
                    fontWeight: 700,
                    marginBottom: '14px',
                  }}
                >
                  Resultado de verificacion
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      border: '1px solid #22c55e',
                      backgroundColor: '#dcfce7',
                      borderRadius: '7px',
                      padding: '13px',
                      fontWeight: 700,
                      color: '#15803d',
                    }}
                  >
                    Firma electronica:{' '}
                    {resultado?.firma_valida ? 'VALIDA' : 'SIN VERIFICAR'}
                  </div>

                  <div
                    style={{
                      border: '1px solid #22c55e',
                      backgroundColor: '#dcfce7',
                      borderRadius: '7px',
                      padding: '13px',
                      fontWeight: 700,
                      color: '#15803d',
                    }}
                  >
                    Rastro inmutable:{' '}
                    {resultado?.rastro_integro ? 'INTEGRO' : 'SIN VERIFICAR'}
                  </div>

                  <div
                    style={{
                      border: '1px solid #22c55e',
                      backgroundColor: '#dcfce7',
                      borderRadius: '7px',
                      padding: '13px',
                      fontWeight: 700,
                      color: '#15803d',
                    }}
                  >
                    Alteraciones detectadas:{' '}
                    {resultado?.alteraciones_detectadas ?? 0}
                  </div>

                  <div
                    style={{
                      border: '1px solid #3b82f6',
                      backgroundColor: '#dbeafe',
                      borderRadius: '7px',
                      padding: '13px',
                      fontWeight: 700,
                      color: '#2563eb',
                    }}
                  >
                    Retencion de evidencia:{' '}
                    {resultado?.retencion_evidencia || '5 anios'}
                  </div>
                </div>
              </CCol>

              <CCol lg={8}>
                <div
                  style={{
                    border: '2px solid #6b7280',
                    borderRadius: '6px',
                    backgroundColor: '#eef2f6',
                    padding: '10px 12px',
                    fontWeight: 700,
                    marginBottom: '14px',
                  }}
                >
                  Rastro de auditoria
                </div>

                <CTable bordered responsive align="middle">
                  <CTableHead>
                    <CTableRow style={{ backgroundColor: '#111827' }}>
                      <CTableHeaderCell style={{ color: '#ffffff', textAlign: 'center' }}>
                        Fecha
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ color: '#ffffff', textAlign: 'center' }}>
                        Evento
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ color: '#ffffff', textAlign: 'center' }}>
                        Actor
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ color: '#ffffff', textAlign: 'center' }}>
                        Estado
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {eventos.map((evento, index) => (
                      <CTableRow key={`${evento.evento}-${index}`}>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {evento.fecha ||
                            evento.fecha_evento ||
                            evento.timestamp ||
                            '-'}
                        </CTableDataCell>

                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {evento.tipo_evento ||
                            evento.evento ||
                            evento.accion ||
                            evento.descripcion ||
                            '-'}
                        </CTableDataCell>

                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {evento.actor || evento.usuario || 'Sistema'}
                        </CTableDataCell>

                        <CTableDataCell
                          style={{
                            textAlign: 'center',
                            color: '#15803d',
                            fontWeight: 700,
                          }}
                        >
                          {evento.estado || evento.resultado || 'OK'}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCol>
            </CRow>

            <div
              style={{
                marginTop: '54px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '12px',
              }}
            >
              La consulta valida integridad, firma electronica y eventos asociados sin
              modificar el registro original.
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AuditoriaReportes