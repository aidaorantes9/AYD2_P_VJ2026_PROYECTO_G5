const BaseAuthAdapter = require('./BaseAuthAdapter')

// Adaptador para universidades que usan SAML.
class SamlAdapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, saml_assertion } = credenciales

        if (!usuario || !saml_assertion) {
            throw this.crearError('SAML requiere usuario y credencial', 400)
        }

        // Para el MVP, la assertion SAML se valida contra la contraseña
        // registrada en Candidato.
        const candidato = await this.buscarCandidatoActivo(usuario, saml_assertion)

        return {
            ...this.crearRespuestaBase(candidato, 'SAML'),
            tipo_identidad: 'federacion_academica',
            mensaje: 'Autenticacion mediante SAML validada contra Candidato'
        }
    }
}

module.exports = SamlAdapter