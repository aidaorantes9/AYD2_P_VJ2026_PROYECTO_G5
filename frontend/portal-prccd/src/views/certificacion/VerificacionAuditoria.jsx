import { useState } from 'react'
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
  'http://localhost:4006'

function colorValidacion(valor) {
  return valor ? 'success' : 'danger'
}

function textoValidacion(valor) {
  return valor ? 'Válido' : 'Inválido'
}

function escaparHtml(valor) {
  return String(valor ?? '').replace(
    /[&<>"']/g,
    (caracter) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[caracter]
  )
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
    const codigo = escaparHtml(certificado.codigo_verificacion)
    const nombre = escaparHtml(
      datos.nombre_completo || 'Candidato certificado'
    )
    const universidad = escaparHtml(
      datos.universidad_origen || 'No disponible'
    )
    const competencia = escaparHtml(
      datos.competencia || 'Competencias Digitales'
    )
    const resultadoEvaluacion = escaparHtml(
      datos.resultado || 'APROBADO'
    )
    const nota = escaparHtml(datos.nota || 'No disponible')
    const fecha = escaparHtml(certificado.fecha_emision)
    const hash = escaparHtml(integridad?.hash_almacenado)

    const contenido = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado PRCCD - ${nombre}</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: #eef2f7;
      font-family: Arial, sans-serif;
      color: #1f2937;
    }

    .certificado {
      max-width: 950px;
      margin: auto;
      padding: 60px;
      background: white;
      border: 12px double #1d4ed8;
      box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
      text-align: center;
    }

    h1 {
      margin: 0;
      color: #1d4ed8;
      font-size: 44px;
      letter-spacing: 2px;
    }

    h2 {
      margin-top: 12px;
      color: #374151;
      font-weight: normal;
    }

    .nombre {
      margin: 35px 0 15px;
      font-size: 36px;
      font-weight: bold;
      color: #111827;
    }

    .competencia {
      font-size: 24px;
      color: #1d4ed8;
      font-weight: bold;
    }

    .datos {
      margin: 35px auto;
      max-width: 700px;
      padding: 25px;
      background: #f8fafc;
      border-radius: 10px;
      text-align: left;
      line-height: 1.8;
    }

    .valido {
      display: inline-block;
      margin: 20px 0;
      padding: 10px 24px;
      border-radius: 20px;
      background: #dcfce7;
      color: #166534;
      font-weight: bold;
    }

    .verificacion {
      margin-top: 35px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      font-size: 13px;
      color: #4b5563;
      word-break: break-all;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .certificado {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <main class="certificado">
    <h1>CERTIFICADO</h1>
    <h2>Plataforma Regional de Certificación de Competencias Digitales</h2>

    <p>Se certifica que</p>
    <div class="nombre">${nombre}</div>

    <p>ha demostrado satisfactoriamente sus conocimientos en</p>
    <div class="competencia">${competencia}</div>

    <section class="datos">
      <div><strong>Universidad:</strong> ${universidad}</div>
      <div><strong>Resultado:</strong> ${resultadoEvaluacion}</div>
      <div><strong>Nota:</strong> ${nota}</div>
      <div><strong>Fecha de emisión:</strong> ${fecha}</div>
    </section>

    <div class="valido">CERTIFICADO CRIPTOGRÁFICAMENTE VÁLIDO</div>

    <section class="verificacion">
      <div><strong>Código de verificación:</strong> ${codigo}</div>
      <div><strong>Algoritmo:</strong> SHA-256 / RSA</div>
      <div><strong>Hash:</strong> ${hash}</div>
    </section>
  </main>
</body>
</html>`

    const archivo = new Blob(
      [contenido],
      { type: 'text/html;charset=utf-8' }
    )

    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download =
      `certificado-${certificado.codigo_verificacion}.html`

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    URL.revokeObjectURL(url)
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
                    Descargar certificado
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
