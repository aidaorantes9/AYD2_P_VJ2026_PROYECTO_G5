import { useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CProgress,
  CRow,
  CSpinner,
} from '@coreui/react'

const API_BASE =
  import.meta.env.VITE_INTEGRACION_API_URL ||
  'http://localhost:4002'

function obtenerSesionActual() {
  try {
    const sesionGuardada =
      sessionStorage.getItem('sesion') || localStorage.getItem('sesion')

    if (!sesionGuardada) {
      return null
    }

    return JSON.parse(sesionGuardada)
  } catch {
    return null
  }
}

const universidades = [
  {
    id: 1,
    nombre: 'Universidad de San Carlos de Guatemala',
    alias: 'USAC',
    protocolo: 'LDAP',
    formato: 'JSON',
    extension: '.json',
  },
  {
    id: 2,
    nombre: 'Universidad de Costa Rica',
    alias: 'UCR',
    protocolo: 'SAML',
    formato: 'XML',
    extension: '.xml',
  },
  {
    id: 3,
    nombre: 'Universidad de El Salvador',
    alias: 'UES',
    protocolo: 'OAuth2',
    formato: 'CSV',
    extension: '.csv',
  },
]

function PanelIngestionDatos() {
  const [universidadId, setUniversidadId] = useState(1)
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)
  const [logs, setLogs] = useState(['Panel listo para recibir archivos academicos'])

  const universidad = useMemo(
    () => universidades.find((item) => item.id === Number(universidadId)),
    [universidadId],
  )

  const agregarLog = (texto) => {
    const hora = new Date().toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setLogs((anteriores) => [`${hora} - ${texto}`, ...anteriores].slice(0, 7))
  }

  const limpiarMensajes = () => {
    setError('')
    setMensaje('')
    setResultado(null)
    setProgreso(0)
  }

  const manejarArchivo = (event) => {
    limpiarMensajes()

    const archivoSeleccionado = event.target.files?.[0]

    if (!archivoSeleccionado) {
      setArchivo(null)
      return
    }

    const nombreArchivo = archivoSeleccionado.name.toLowerCase()

    if (!nombreArchivo.endsWith(universidad.extension)) {
      setArchivo(null)
      setError(`La universidad seleccionada espera un archivo ${universidad.formato}`)
      agregarLog(`Archivo rechazado: ${archivoSeleccionado.name}`)
      return
    }

    setArchivo(archivoSeleccionado)
    agregarLog(`Archivo seleccionado: ${archivoSeleccionado.name}`)
  }

  const autenticarOrigen = async () => {

    const sesion = obtenerSesionActual()

    if (!sesion?.autenticado) {
      throw new Error('Debe iniciar sesión para validar archivos académicos')
    }

    if (sesion.rol !== 'admin') {
      throw new Error('Solo el administrador puede validar y procesar archivos académicos')
    }

    return {
      ok: true,
      modulo: 'Integracion e Ingesta',
      patron: 'Admin local',
      resultado: {
        autenticado: true,
        protocolo_usado: universidad.protocolo_auth,
        formato_datos: universidad.formato_datos,
        id_universidad: universidad.id,
        universidad: universidad.nombre,
        rol: sesion.rol,
        usuario: sesion.nombre || 'Administrador',
        mensaje: 'Administrador autorizado para procesar archivos académicos',
      },
    }
    }

  const validarArchivo = async () => {
    limpiarMensajes()

    if (!archivo) {
      setError('Primero seleccione un archivo')
      return
    }

    setCargando(true)

    try {
      setProgreso(25)
      agregarLog(`Validando protocolo ${universidad.protocolo}`)

      const autenticacion = await autenticarOrigen()

      setProgreso(65)

      const contenido = await archivo.text()

      if (!contenido.trim()) {
        throw new Error('El archivo seleccionado esta vacio')
      }

      setProgreso(100)
      setMensaje(`Archivo validado correctamente con ${autenticacion.resultado.protocolo_usado}`)
      agregarLog(`Formato ${universidad.formato} validado`)
    } catch (err) {
      setError(err.message)
      agregarLog(`Error de validacion: ${err.message}`)
      setProgreso(0)
    } finally {
      setCargando(false)
    }
  }

  const procesarDatos = async () => {
    limpiarMensajes()

    if (!archivo) {
      setError('Primero seleccione un archivo')
      return
    }

    setCargando(true)

    try {
      setProgreso(20)
      agregarLog(`Autenticando origen ${universidad.alias}`)

      await autenticarOrigen()

      setProgreso(45)
      agregarLog('Leyendo archivo seleccionado')

      const contenido = await archivo.text()

      const respuesta = await fetch(`${API_BASE}/api/integracion/ingesta/procesar-archivo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_universidad: universidad.id,
          nombre_archivo: archivo.name,
          contenido_archivo: contenido,
        }),
      })

      const data = await respuesta.json()

      if (!respuesta.ok || !data.ok) {
        throw new Error(data.mensaje || 'No se pudo procesar el archivo')
      }

      setProgreso(100)
      setResultado(data)
      setMensaje('Datos procesados correctamente')
      agregarLog('Normalizacion completada')
      agregarLog('Persistencia completada')
    } catch (err) {
      setError(err.message)
      agregarLog(`Error de procesamiento: ${err.message}`)
      setProgreso(0)
    } finally {
      setCargando(false)
    }
  }

  return (
    <CContainer fluid style={{ padding: '30px' }}>
      <CCard
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          borderRadius: '18px',
          border: '1px solid #d8dee6',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <CCardBody style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Ingesta academica</h3>
              <small style={{ color: '#64748b' }}>
                Recepcion, validacion y procesamiento de archivos universitarios.
              </small>
            </div>
          </div>

          <CRow className="g-4">
            <CCol lg={5}>
              <CCard style={{ border: '1px solid #e5e7eb', height: '100%' }}>
                <CCardBody>
                  <h5 style={{ fontWeight: 700, marginBottom: '18px' }}>Origen del archivo</h5>

                  <div style={{ marginBottom: '16px' }}>
                    <CFormLabel>Universidad</CFormLabel>
                    <CFormSelect
                      value={universidadId}
                      onChange={(e) => {
                        setUniversidadId(e.target.value)
                        setArchivo(null)
                        limpiarMensajes()
                        agregarLog('Cambio de universidad')
                      }}
                    >
                      {universidades.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>

                  <CRow className="g-3" style={{ marginBottom: '16px' }}>
                    <CCol md={6}>
                      <CFormLabel>Protocolo</CFormLabel>
                      <CFormInput value={universidad.protocolo} disabled />
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Formato</CFormLabel>
                      <CFormInput value={universidad.formato} disabled />
                    </CCol>
                  </CRow>

                  <div
                    style={{
                      border: '2px dashed #94a3b8',
                      borderRadius: '14px',
                      padding: '18px',
                      background: '#f8fafc',
                      marginBottom: '16px',
                    }}
                  >
                    <CFormLabel style={{ fontWeight: 700 }}>Archivo recibido</CFormLabel>

                    <CFormInput
                      type="file"
                      accept=".json,.xml,.csv"
                      onChange={manejarArchivo}
                    />

                    <small style={{ display: 'block', marginTop: '10px', color: '#64748b' }}>
                      Seleccione un archivo compatible con la universidad elegida.
                    </small>
                  </div>

                  {archivo && (
                    <CAlert color="info">
                      <strong>{archivo.name}</strong>
                      <br />
                      <small>{(archivo.size / 1024).toFixed(2)} KB</small>
                    </CAlert>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <CButton
                      color="success"
                      variant="outline"
                      disabled={cargando}
                      onClick={validarArchivo}
                      style={{ width: '50%', fontWeight: 700 }}
                    >
                      {cargando ? <CSpinner size="sm" /> : 'Validar'}
                    </CButton>

                    <CButton
                      color="primary"
                      disabled={cargando}
                      onClick={procesarDatos}
                      style={{ width: '50%', fontWeight: 700 }}
                    >
                      {cargando ? <CSpinner size="sm" /> : 'Procesar'}
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol lg={7}>
              <CCard style={{ border: '1px solid #e5e7eb', marginBottom: '18px' }}>
                <CCardBody>
                  <h5 style={{ fontWeight: 700, marginBottom: '16px' }}>
                    Estado de procesamiento
                  </h5>

                  <CProgress value={progreso} style={{ height: '18px', marginBottom: '18px' }}>
                    {progreso}%
                  </CProgress>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      gap: '10px',
                      marginBottom: '18px',
                    }}
                  >
                    {['Recepcion', 'Validacion', 'Normalizacion', 'Persistencia'].map(
                      (paso, index) => (
                        <div
                          key={paso}
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                            background: progreso >= (index + 1) * 25 ? '#dcfce7' : '#f1f5f9',
                            color: progreso >= (index + 1) * 25 ? '#166534' : '#475569',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          {paso}
                        </div>
                      ),
                    )}
                  </div>

                  {error && <CAlert color="danger">{error}</CAlert>}

                  {mensaje && !error && <CAlert color="success">{mensaje}</CAlert>}

                  {resultado && !error && (
                    <CAlert color="primary">
                      <strong>Resumen de ingesta</strong>
                      <br />
                      Archivo: {resultado.archivo}
                      <br />
                      Formato: {resultado.formato_datos}
                      <br />
                      Candidatos procesados: {resultado.total_candidatos}
                      <br />
                      Cursos persistidos: {resultado.persistencia?.cursos_persistidos || 0}
                    </CAlert>
                  )}
                </CCardBody>
              </CCard>

              <CCard style={{ border: '1px solid #e5e7eb' }}>
                <CCardBody>
                  <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Bitacora</h5>

                  <div
                    style={{
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderRadius: '12px',
                      minHeight: '165px',
                      padding: '16px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}
                  >
                    {logs.map((log, index) => (
                      <div key={`${log}-${index}`}>{log}</div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default PanelIngestionDatos