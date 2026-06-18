import { useMemo, useState } from 'react'
import { CContainer, CCard, CCardBody, CFormInput, CFormSelect, CButton, CBadge } from '@coreui/react'

import FachadaIntegracion from '../facades/FachadaIntegracion'

function LoginIntegracion() {

    // Universidades disponibles para probar la integración
    const universidades = FachadaIntegracion.obtenerUniversidades()

    // Datos del formulario
    const [idUniversidad, setIdUniversidad] = useState(1)
    const [usuario, setUsuario] = useState('ana.lopez@usac.edu.gt')
    const [credencial, setCredencial] = useState('password-simulado-ldap')

    // Estados para mostrar respuesta o error
    const [cargando, setCargando] = useState(false)
    const [resultado, setResultado] = useState(null)
    const [error, setError] = useState('')

    // Obtiene la universidad seleccionada para mostrar su protocolo
    const universidadSeleccionada = useMemo(() => {
        return FachadaIntegracion.obtenerUniversidadPorId(idUniversidad)
    }, [idUniversidad])

    // Cambia el texto del campo de credencial según el protocolo
    const textoCredencial = useMemo(() => {
        if (!universidadSeleccionada) return 'Credencial'

        if (universidadSeleccionada.protocolo_auth === 'LDAP') {
        
            return 'Contraseña LDAP'
        
        }

        if (universidadSeleccionada.protocolo_auth === 'SAML') {
        
            return 'Assertion SAML'
        
        }

        return 'Token OAuth2'
    }, [universidadSeleccionada])

    // Actualiza datos de prueba al cambiar de universidad.
    function cambiarUniversidad(event) {
        
        const nuevoId = Number(event.target.value)
        const universidad = FachadaIntegracion.obtenerUniversidadPorId(nuevoId)

        setIdUniversidad(nuevoId)
        setResultado(null)
        setError('')

        if (universidad?.protocolo_auth === 'LDAP') {
        
            setUsuario('ana.lopez@usac.edu.gt')
            setCredencial('password-simulado-ldap')
        
        }

        if (universidad?.protocolo_auth === 'SAML') {
        
            setUsuario('carlos.mora@ucr.ac.cr')
            setCredencial('assertion-simulada')
        
        }

        if (universidad?.protocolo_auth === 'OAuth2') {
        
            setUsuario('maria.ramos@ues.edu.sv')        
            setCredencial('token-simulado')

        }
    }

    // Envía los datos a la fachada de integración.
    async function iniciarSesion(event) {
        
        event.preventDefault()

        setCargando(true)
        setResultado(null)
        setError('')

        try {
        
            const respuesta = await FachadaIntegracion.iniciarSesionUniversidad({
            id_universidad: idUniversidad,
            usuario,
            credencial
            })

            setResultado(respuesta)
        } catch (err) {
        
            setError(err.message)
        
        } finally {
        
            setCargando(false)
        
        }

    }

    return (
        <CContainer
        style={{
            maxWidth: '760px',
            marginTop: '40px'
        }}
        >
        <CCard>
            <CCardBody style={{ padding: '28px' }}>
            <div style={{ marginBottom: '22px' }}>
                <h3 style={{ marginBottom: '6px' }}>
                Acceso universitario
                </h3>

                <p style={{ marginBottom: 0 }}>
                Seleccione una universidad para simular el inicio de sesión con el
                protocolo configurado para la institución (es temporal asi)
                </p>
            </div>

            <form onSubmit={iniciarSesion}>
                <div style={{ marginBottom: '18px' }}>
                <CFormSelect
                    label="Universidad"
                    value={idUniversidad}
                    onChange={cambiarUniversidad}
                >
                    {universidades.map((universidad) => (
                    <option
                        key={universidad.id_universidad}
                        value={universidad.id_universidad}
                    >
                        {universidad.siglas} - {universidad.nombre}
                    </option>
                    ))}
                </CFormSelect>
                </div>

                {universidadSeleccionada && (
                <div
                    style={{
                    marginBottom: '18px',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px'
                    }}
                >
                    <div style={{ marginBottom: '8px' }}>
                    Configuración detectada
                    </div>

                    <CBadge color="primary" style={{ marginRight: '8px' }}>
                    {universidadSeleccionada.protocolo_auth}
                    </CBadge>

                    <CBadge color="secondary">
                    {universidadSeleccionada.formato_datos}
                    </CBadge>
                </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                <CFormInput
                    label="Usuario institucional"
                    type="email"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                />
                </div>

                <div style={{ marginBottom: '20px' }}>
                <CFormInput
                    label={textoCredencial}
                    type="text"
                    value={credencial}
                    onChange={(event) => setCredencial(event.target.value)}
                />
                </div>

                <CButton
                type="submit"
                color="primary"
                disabled={cargando}
                >
                {cargando ? 'Validando...' : 'Validar acceso'}
                </CButton>
            </form>

            {error && (
                <div
                style={{
                    marginTop: '20px',
                    padding: '12px',
                    border: '1px solid #dc3545',
                    borderRadius: '6px'
                }}
                >
                <strong>No se pudo validar:</strong> {error}
                </div>
            )}

            {resultado && (
                <div
                style={{
                    marginTop: '22px',
                    padding: '16px',
                    border: '1px solid #198754',
                    borderRadius: '6px'
                }}
                >
                <div style={{ marginBottom: '10px' }}>
                    <strong>Resultado de la integración</strong>
                </div>

                <p style={{ marginBottom: '6px' }}>
                    Universidad: {resultado.resultado?.universidad}
                </p>

                <p style={{ marginBottom: '6px' }}>
                    Protocolo usado: {resultado.resultado?.protocolo_usado}
                </p>

                <p style={{ marginBottom: '6px' }}>
                    Formato de datos: {resultado.resultado?.formato_datos}
                </p>

                <p style={{ marginBottom: 0 }}>
                    Estado: {resultado.resultado?.mensaje}
                </p>
                </div>
            )}
            </CCardBody>
        </CCard>
        </CContainer>
    )
}

export default LoginIntegracion