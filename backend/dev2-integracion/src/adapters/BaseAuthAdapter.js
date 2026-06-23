const pool = require('../db')
const { descifrar } = require('../utils/cryptoDatos')

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

    convertirCampo(valor) {
        if (valor === null || valor === undefined) {
            return ''
        }

        if (Buffer.isBuffer(valor)) {
            try {
                return descifrar(valor)
            } catch {
                return valor.toString('utf8')
            }
        }

        try {
            return descifrar(Buffer.from(valor))
        } catch {
            return String(valor)
        }
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
                c.nombre_cifrado,
                c.email_cifrado,
                c.contrasenia,
                c.genero,
                c.id_externo_univ,
                c.estado_gdpr
            FROM Candidato c
            WHERE c.id_universidad = ?
              AND c.estado_gdpr = 'activo'
            `,
            [this.universidad.id_universidad]
        )

        const candidatoEncontrado = candidatos.find((candidato) => {
            const emailCandidato = this.convertirCampo(candidato.email_cifrado)
                .trim()
                .toLowerCase()

            const contraseniaCandidato = String(candidato.contrasenia || '')
                .trim()

            return (
                emailCandidato === usuarioNormalizado &&
                contraseniaCandidato === contraseniaNormalizada
            )
        })

        if (!candidatoEncontrado) {
            throw this.crearError('Usuario o contraseña incorrectos', 401)
        }

        return {
            ...candidatoEncontrado,
            nombre_candidato: this.convertirCampo(candidatoEncontrado.nombre_cifrado),
            email_candidato: this.convertirCampo(candidatoEncontrado.email_cifrado),
        }
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