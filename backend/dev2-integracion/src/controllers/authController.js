// Se importa la conexión a la base de datos
const pool = require('../db');

// Se importa la fábrica que selecciona el adaptador correcto
const AdapterFactory = require('../adapters/AdapterFactory');

// Controlador para autenticar contra una universidad simulada
async function autenticarUniversidad(req, res) {
    try {
        // Se reciben los posibles datos de autenticación desde el body
        const {
            id_universidad,
            usuario,
            password,
            saml_assertion,
            access_token
        } = req.body;

        // Se valida que venga la universidad, porque de ahí se obtiene el protocolo
        if (!id_universidad) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El campo id_universidad es obligatorio'
            });
        }

        // Se consulta la universidad para saber qué protocolo utiliza
        const [universidades] = await pool.query(
            `
            SELECT 
                id_universidad,
                nombre,
                protocolo_auth,
                formato_datos,
                estado
            FROM Universidad
            WHERE id_universidad = ?
            `,
            [id_universidad]
        );

        // Si no existe la universidad, no se puede seleccionar adaptador
        if (universidades.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Universidad no encontrada'
            });
        }

        const universidad = universidades[0];

        // Se valida que la universidad esté activa para permitir la integración
        if (universidad.estado !== 'activo') {
            return res.status(400).json({
                ok: false,
                mensaje: 'La universidad no se encuentra activa'
            });
        }

        // Se crea el adaptador correspondiente: LDAP, SAML u OAuth2
        const adapter = AdapterFactory.crear(universidad);

        // Se ejecuta la autenticación simulada usando el adaptador seleccionado
        const resultado = await adapter.autenticar({
            usuario,
            password,
            saml_assertion,
            access_token
        });

        // Se responde con el resultado normalizado
        return res.json({
            ok: true,
            modulo: 'Integracion e Ingesta',
            patron: 'Adapter',
            resultado
        });

    } catch (error) {
        // Se captura cualquier error de validación, base de datos o adaptador
        return res.status(500).json({
            ok: false,
            mensaje: error.message
        });
    }
}

module.exports = {
    autenticarUniversidad
};