const pool = require('../db')

// Clase base para definir el comportamiento común de los adaptadores.
// Aquí se concentra la validación real contra la tabla Candidato.
class BaseAuthAdapter {
    constructor(universidad) {
        this.universidad = universidad
    }

    async autenticar() {
        throw new Error('El metodo autenticar debe ser implementado por cada adaptador')
    }

    crearError(mensaje, statusCode = 400) {
        const error = new Error(mensaje)
        error.statusCode = statusCode
        return error
    }

    async buscarCandidatoActivo(usuario, contrasenia) {
        const usuarioNormalizado = String(usuario || '').trim().toLowerCase()
        const contraseniaNormalizada = String(contrasenia || '').trim()

        if (!usuarioNormalizado || !contraseniaNormalizada) {
            throw this.crearError('Debe ingresar usuario y contraseña', 400)
        }

        const [candidatos] = await pool.query(
            `
            SELECT
                c.id_candidato,
                c.id_universidad,
                CAST(c.nombre_cifrado AS CHAR) AS nombre_candidato,
                CAST(c.email_cifrado AS CHAR) AS email_candidato,
                c.genero,
                c.id_externo_univ,
                c.estado_gdpr
            FROM Candidato c
            WHERE c.id_universidad = ?
                AND c.estado_gdpr = 'activo'
                AND LOWER(CAST(c.email_cifrado AS CHAR)) = ?
                AND c.contrasenia = ?
            LIMIT 1
            `,
            [
                this.universidad.id_universidad,
                usuarioNormalizado,
                contraseniaNormalizada
            ]
        )

        if (candidatos.length === 0) {
            throw this.crearError('Usuario o contraseña incorrectos', 401)
        }

        return candidatos[0]
    }

    crearRespuestaBase(candidato, protocolo) {
        return {
            autenticado: true,
            protocolo_usado: protocolo,

            id_universidad: this.universidad.id_universidad,
            universidad: this.universidad.nombre,
            formato_datos: this.universidad.formato_datos,

            id_candidato: candidato.id_candidato,
            nombre_candidato: candidato.nombre_candidato,
            email_candidato: candidato.email_candidato,
            usuario_externo: candidato.email_candidato,
            genero: candidato.genero,
            id_externo_univ: candidato.id_externo_univ,

            fecha_autenticacion: new Date().toISOString()
        }
    }
}

module.exports = BaseAuthAdapter