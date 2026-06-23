const pool = require('../db')
const AdapterFactory = require('../adapters/AdapterFactory')

// Controlador para autenticar contra una universidad usando Adapter.
async function autenticarUniversidad(req, res) {
    try {
        const {
            id_universidad,
            usuario,
            password,
            saml_assertion,
            access_token
        } = req.body

        if (!id_universidad) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El campo id_universidad es obligatorio'
            })
        }

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
        )

        if (universidades.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Universidad no encontrada'
            })
        }

        const universidad = universidades[0]

        if (universidad.estado !== 'activo') {
            return res.status(400).json({
                ok: false,
                mensaje: 'La universidad no se encuentra activa'
            })
        }

        const adapter = AdapterFactory.crear(universidad)

        const resultado = await adapter.autenticar({
            usuario,
            password,
            saml_assertion,
            access_token
        })

        return res.status(200).json({
            ok: true,
            modulo: 'Integracion e Ingesta',
            patron: 'Adapter',
            resultado
        })

    } catch (error) {
        const statusCode = error.statusCode || 500

        return res.status(statusCode).json({
            ok: false,
            mensaje: error.message || 'Error interno al autenticar'
        })
    }
}

module.exports = {
    autenticarUniversidad
}