const BaseAuthAdapter = require('./BaseAuthAdapter')

// Adaptador para universidades que usan OAuth2.
class OAuth2Adapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, access_token } = credenciales

        if (!usuario || !access_token) {
            throw this.crearError('OAuth2 requiere usuario y credencial', 400)
        }

        // Para el MVP, el token OAuth2 se valida contra la contraseña
        // registrada en Candidato.
        const candidato = await this.buscarCandidatoActivo(usuario, access_token)

        return {
            ...this.crearRespuestaBase(candidato, 'OAuth2'),
            tipo_identidad: 'token_acceso',
            mensaje: 'Autenticacion mediante OAuth2 validada contra Candidato'
        }
    }
}

module.exports = OAuth2Adapter