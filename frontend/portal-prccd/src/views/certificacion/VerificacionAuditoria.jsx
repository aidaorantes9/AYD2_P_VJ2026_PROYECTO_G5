import { useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const API_URL =
  import.meta.env.VITE_CERTIFICACION_API_URL ||
  'http://localhost:4003'

function colorValidacion(valor) {
  return valor ? 'success' : 'danger'
}

function textoValidacion(valor) {
  return valor ? 'Válido' : 'Inválido'
}


function VerificacionAuditoria() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function consultarCertificado(evento) {
    evento.preventDefault()

    const codigoLimpio = codigo.trim()

    if (!codigoLimpio) {
      setMensaje({
        tipo: 'warning',
        texto: 'Ingresa un código de verificación.',
      })
      return
    }

    setCargando(true)
    setMensaje(null)
    setResultado(null)

    try {
      const respuesta = await fetch(
        `${API_URL}/api/auditoria/verificar/${encodeURIComponent(codigoLimpio)}`
      )

      const datos = await respuesta.json()

      if (respuesta.status === 404) {
        setMensaje({
          tipo: 'warning',
          texto: datos.error || 'Certificado no encontrado.',
        })
        return
      }

      if (!respuesta.ok && respuesta.status !== 422) {
        setMensaje({
          tipo: 'danger',
          texto: datos.error || 'No fue posible consultar el certificado.',
        })
        return
      }

      setResultado(datos)

      setMensaje({
        tipo: datos.valido ? 'success' : 'danger',
        texto: datos.mensaje,
      })
    } catch {
      setMensaje({
        tipo: 'danger',
        texto: 'No se pudo conectar con el servicio de certificación y auditoría.',
      })
    } finally {
      setCargando(false)
    }
  }

  function limpiarConsulta() {
    setCodigo('')
    setResultado(null)
    setMensaje(null)
  }

  const certificado = resultado?.certificado
  const integridad = resultado?.integridad_certificado
  const eventos = resultado?.eventos || []
  const anomalias = resultado?.anomalias || []

  function descargarCertificado() {
    if (!resultado?.valido || !certificado) {
      return
    }

    const datos = certificado.datos || {}

    const nombre =
      datos.nombre_completo || 'Candidato certificado'
    const universidad =
      datos.universidad_origen || 'No disponible'
    const competencia =
      datos.competencia || 'Competencias Digitales'
    const resultadoEvaluacion =
      datos.resultado || 'APROBADO'
    const nota =
      datos.nota ?? 'No disponible'

    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const anchoPagina = documento.internal.pageSize.getWidth()
    const altoPagina = documento.internal.pageSize.getHeight()
    const centro = anchoPagina / 2

    // Marco exterior e interior
    documento.setDrawColor(29, 78, 216)
    documento.setLineWidth(2)
    documento.rect(8, 8, anchoPagina - 16, altoPagina - 16)

    documento.setLineWidth(0.5)
    documento.rect(13, 13, anchoPagina - 26, altoPagina - 26)

    // Encabezado
    documento.setTextColor(29, 78, 216)
    documento.setFont('helvetica', 'bold')
    documento.setFontSize(30)
    documento.text('CERTIFICADO', centro, 38, {
      align: 'center',
    })

    documento.setTextColor(55, 65, 81)
    documento.setFont('helvetica', 'normal')
    documento.setFontSize(14)
    documento.text(
      'Plataforma Regional de Certificación de Competencias Digitales',
      centro,
      50,
      { align: 'center' }
    )

    documento.setFontSize(12)
    documento.text('Se certifica que', centro, 70, {
      align: 'center',
    })

    // Nombre del candidato
    documento.setTextColor(17, 24, 39)
    documento.setFont('helvetica', 'bold')
    documento.setFontSize(25)
    documento.text(nombre, centro, 88, {
      align: 'center',
    })

    documento.setFont('helvetica', 'normal')
    documento.setFontSize(12)
    documento.text(
      'ha demostrado satisfactoriamente sus conocimientos en',
      centro,
      102,
      { align: 'center' }
    )

    documento.setTextColor(29, 78, 216)
    documento.setFont('helvetica', 'bold')
    documento.setFontSize(18)
    documento.text(competencia, centro, 116, {
      align: 'center',
    })

    // Datos del certificado
    documento.setTextColor(31, 41, 55)
    documento.setFontSize(11)

    documento.setFont('helvetica', 'bold')
    documento.text('Universidad:', 55, 137)
    documento.setFont('helvetica', 'normal')
    documento.text(String(universidad), 82, 137)

    documento.setFont('helvetica', 'bold')
    documento.text('Resultado:', 155, 137)
    documento.setFont('helvetica', 'normal')
    documento.text(String(resultadoEvaluacion), 180, 137)

    documento.setFont('helvetica', 'bold')
    documento.text('Nota:', 55, 149)
    documento.setFont('helvetica', 'normal')
    documento.text(String(nota), 70, 149)

    documento.setFont('helvetica', 'bold')
    documento.text('Fecha de emisión:', 155, 149)
    documento.setFont('helvetica', 'normal')
    documento.text(
      String(certificado.fecha_emision),
      191,
      149
    )

    // Estado validado
    documento.setFillColor(220, 252, 231)
    documento.setDrawColor(22, 101, 52)
    documento.roundedRect(
      centro - 32,
      160,
      64,
      12,
      3,
      3,
      'FD'
    )

    documento.setTextColor(22, 101, 52)
    documento.setFont('helvetica', 'bold')
    documento.setFontSize(12)
    documento.text(
      'CERTIFICADO VALIDADO',
      centro,
      168,
      { align: 'center' }
    )

    // Información de verificación
    documento.setTextColor(75, 85, 99)
    documento.setFont('helvetica', 'normal')
    documento.setFontSize(8)

    documento.text(
      `Código de verificación: ${certificado.codigo_verificacion}`,
      centro,
      184,
      { align: 'center' }
    )

    documento.text(
      'Algoritmo criptográfico: SHA-256 / RSA',
      centro,
      190,
      { align: 'center' }
    )

    documento.setFontSize(7)
    const hashDividido = documento.splitTextToSize(
      `Hash: ${integridad?.hash_almacenado || ''}`,
      230
    )

    documento.text(
      hashDividido,
      centro,
      196,
      { align: 'center' }
    )

    documento.save(
      `certificado-${certificado.codigo_verificacion}.pdf`
    )
  }

  return (
    <CContainer className="py-4">
      <div className="mb-4 text-start">
        <h2 className="mb-2">Verificación de certificados</h2>
        <p className="text-body-secondary">
          Consulta la autenticidad del certificado, su firma electrónica
          y el rastro inmutable de auditoría.
        </p>
      </div>

      <CCard className="mb-4">
        <CCardHeader>
          <strong>Código de verificación</strong>
        </CCardHeader>

        <CCardBody>
          <CForm onSubmit={consultarCertificado}>
            <CRow className="g-3 align-items-end">
              <CCol md={9}>
                <CFormInput
                  label="Identificador del certificado"
                  placeholder="Ej. 8274e38d-2ca2-44d3-a569-bdec6012da54"
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value)}
                  disabled={cargando}
                />
              </CCol>

              <CCol md={3} className="d-grid">
                <CButton
                  color="primary"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando && (
                    <CSpinner size="sm" className="me-2" />
                  )}
                  Verificar
                </CButton>
              </CCol>
            </CRow>
          </CForm>

          {(resultado || mensaje) && (
            <div className="mt-3">
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                onClick={limpiarConsulta}
                disabled={cargando}
              >
                Limpiar consulta
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>

      {mensaje && (
        <CAlert color={mensaje.tipo}>
          {mensaje.texto}
        </CAlert>
      )}

      {resultado && (
        <>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Resultado general</strong>

              <CBadge color={resultado.valido ? 'success' : 'danger'}>
                {resultado.valido
                  ? 'CERTIFICADO VÁLIDO'
                  : 'POSIBLE FRAUDE'}
              </CBadge>
            </CCardHeader>

            <CCardBody className="text-start">
              <CRow className="g-3">
                <CCol md={6}>
                  <strong>Código:</strong>
                  <div className="text-break">
                    {certificado?.codigo_verificacion}
                  </div>
                </CCol>

                <CCol md={3}>
                  <strong>Estado:</strong>
                  <div>
                    <CBadge
                      color={
                        certificado?.estado === 'emitido'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {certificado?.estado}
                    </CBadge>
                  </div>
                </CCol>

                <CCol md={3}>
                  <strong>Fecha de emisión:</strong>
                  <div>{certificado?.fecha_emision}</div>
                </CCol>
              </CRow>

              {certificado?.datos && (
                <CRow className="g-3 mt-1">
                  <CCol md={6}>
                    <strong>Candidato:</strong>
                    <div>
                      {certificado.datos.nombre_completo || 'No disponible'}
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <strong>Universidad:</strong>
                    <div>
                      {certificado.datos.universidad_origen || 'No disponible'}
                    </div>
                  </CCol>

                  <CCol md={3}>
                    <strong>Resultado:</strong>
                    <div>
                      {certificado.datos.resultado || 'No disponible'}
                    </div>
                  </CCol>
                </CRow>
              )}

              {resultado.valido && (
                <div className="mt-4">
                  <CButton
                    color="success"
                    onClick={descargarCertificado}
                  >
                    Descargar PDF
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Validación criptográfica</strong>
            </CCardHeader>

            <CCardBody className="text-start">
              <CRow className="g-3">
                <CCol md={4}>
                  Hash del certificado:{' '}
                  <CBadge color={colorValidacion(integridad?.hash_valido)}>
                    {textoValidacion(integridad?.hash_valido)}
                  </CBadge>
                </CCol>

                <CCol md={4}>
                  Firma electrónica:{' '}
                  <CBadge color={colorValidacion(integridad?.firma_valida)}>
                    {textoValidacion(integridad?.firma_valida)}
                  </CBadge>
                </CCol>

                <CCol md={4}>
                  Vigencia:{' '}
                  <CBadge
                    color={colorValidacion(
                      integridad?.certificado_vigente
                    )}
                  >
                    {integridad?.certificado_vigente
                      ? 'Vigente'
                      : 'No vigente'}
                  </CBadge>
                </CCol>
              </CRow>

              <hr />

              <div className="mb-2">
                <strong>Hash almacenado</strong>
                <div
                  className="text-break font-monospace small"
                  style={{ wordBreak: 'break-all' }}
                >
                  {integridad?.hash_almacenado}
                </div>
              </div>

              <div>
                <strong>Hash calculado</strong>
                <div
                  className="text-break font-monospace small"
                  style={{ wordBreak: 'break-all' }}
                >
                  {integridad?.hash_calculado}
                </div>
              </div>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                Rastro de auditoría ({resultado.total_eventos})
              </strong>
            </CCardHeader>

            <CCardBody>
              {eventos.length === 0 ? (
                <CAlert color="warning" className="mb-0">
                  El certificado no posee eventos de auditoría.
                </CAlert>
              ) : (
                <div className="table-responsive">
                  <CTable striped hover align="middle">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Evento</CTableHeaderCell>
                        <CTableHeaderCell>Tipo</CTableHeaderCell>
                        <CTableHeaderCell>Fecha</CTableHeaderCell>
                        <CTableHeaderCell>Enlace</CTableHeaderCell>
                        <CTableHeaderCell>Hash</CTableHeaderCell>
                        <CTableHeaderCell>Firma</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {eventos.map((evento) => (
                        <CTableRow key={evento.id_evento}>
                          <CTableDataCell>
                            {evento.id_evento}
                          </CTableDataCell>

                          <CTableDataCell>
                            {evento.tipo_evento}
                          </CTableDataCell>

                          <CTableDataCell>
                            {evento.fecha_evento}
                          </CTableDataCell>

                          <CTableDataCell>
                            <CBadge
                              color={colorValidacion(
                                evento.enlace_valido
                              )}
                            >
                              {textoValidacion(
                                evento.enlace_valido
                              )}
                            </CBadge>
                          </CTableDataCell>

                          <CTableDataCell>
                            <CBadge
                              color={colorValidacion(
                                evento.hash_valido
                              )}
                            >
                              {textoValidacion(
                                evento.hash_valido
                              )}
                            </CBadge>
                          </CTableDataCell>

                          <CTableDataCell>
                            <CBadge
                              color={colorValidacion(
                                evento.firma_valida
                              )}
                            >
                              {textoValidacion(
                                evento.firma_valida
                              )}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>

          {anomalias.length > 0 && (
            <CCard className="border-danger">
              <CCardHeader className="text-danger">
                <strong>Anomalías detectadas</strong>
              </CCardHeader>

              <CCardBody className="text-start">
                {anomalias.map((anomalia, indice) => (
                  <CAlert
                    color="danger"
                    key={`${anomalia.tipo}-${indice}`}
                  >
                    <strong>{anomalia.tipo}</strong>
                    {anomalia.id_evento && (
                      <> — Evento {anomalia.id_evento}</>
                    )}
                    <div>{anomalia.detalle}</div>
                  </CAlert>
                ))}
              </CCardBody>
            </CCard>
          )}
        </>
      )}
    </CContainer>
  )
}

export default VerificacionAuditoria
