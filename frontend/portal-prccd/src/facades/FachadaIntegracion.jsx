// URL base del backend mio (Kevin - 202101007)
// Si existe una variable de entorno, se usa esa. Si no, se usa localhost:4002.
const API_BASE_URL =
  import.meta.env.VITE_INTEGRACION_API_URL ||
  'http://localhost:4002'
// (ACLARACION: por el momento usara localhost 4002, luego es que se integrara todo)

// Catálogo usado por la pantalla para simular las universidades disponibles
// Los id_universidad coinciden con los datos insertados en el seed.sql (que son de prueba actualmente va)
const UNIVERSIDADES = [
    {
        id_universidad: 1,
        nombre: 'Universidad de San Carlos de Guatemala',
        siglas: 'USAC',
        protocolo_auth: 'LDAP',
        formato_datos: 'JSON'
    },
    {
        id_universidad: 2,
        nombre: 'Universidad de Costa Rica',
        siglas: 'UCR',
        protocolo_auth: 'SAML',
        formato_datos: 'XML'
    },
    {
        id_universidad: 3,
        nombre: 'Universidad de El Salvador',
        siglas: 'UES',
        protocolo_auth: 'OAuth2',
        formato_datos: 'CSV'
    }
];

class FachadaIntegracion {
    
    // Devuelve las universidades simuladas para llenar el select del login
    static obtenerUniversidades() {
        return UNIVERSIDADES;
    }

    // Busca la universidad seleccionada por su id
    static obtenerUniversidadPorId(idUniversidad) {
        
        return UNIVERSIDADES.find((universidad) => universidad.id_universidad === Number(idUniversidad));
    }

    // Inicia sesión contra el backend de integración
    // La pantalla no necesita saber si por dentro se usa LDAP, SAML u OAuth2
    static async iniciarSesionUniversidad(datosLogin) {

        const {
        id_universidad,
        usuario,
        credencial
        } = datosLogin;

        const universidad = this.obtenerUniversidadPorId(id_universidad);

        if (!universidad) {
        
            throw new Error('Universidad no encontrada en la fachada de integración');
        
        }

        // Body base que todos los adaptadores reciben.
        const body = {
        id_universidad: Number(id_universidad),
        usuario
        };

        // Si la universidad usa LDAP, se envía password.
        if (universidad.protocolo_auth === 'LDAP') {
            
            body.password = credencial;
        
        }

        // Si la universidad usa SAML, se envía una assertion simulada.
        if (universidad.protocolo_auth === 'SAML') {
        
            body.saml_assertion = credencial || 'assertion-simulada';
        
        }

        // Si la universidad usa OAuth2, se envía un token simulado.
        if (universidad.protocolo_auth === 'OAuth2') {
        
            body.access_token = credencial || 'token-simulado';
        
        }

        const respuesta = await fetch(`${API_BASE_URL}/api/integracion/autenticacion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
        });

        const data = await respuesta.json();

        if (!respuesta.ok || data.ok === false) {
    
            throw new Error(data.mensaje || 'No se pudo iniciar sesión');
    
        }

        return data;
    }
}

export default FachadaIntegracion;