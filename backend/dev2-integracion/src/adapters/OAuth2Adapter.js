// Se importa la clase base del adaptador.
const BaseAuthAdapter = require('./BaseAuthAdapter');

// Adaptador para universidades que usan OAuth2.
class OAuth2Adapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, access_token } = credenciales;

        // OAuth2 se simula usando usuario o token de acceso.
        if (!usuario && !access_token) {
            throw new Error('OAuth2 requiere usuario o access_token');
        }

        // Se devuelve la respuesta en el mismo formato que LDAP y SAML.
        return {
            ...this.crearRespuestaBase(usuario || 'usuario_oauth2', 'OAuth2'),
            tipo_identidad: 'token_acceso',
            mensaje: 'Autenticacion simulada mediante OAuth2 completada'
        };
    }
}

module.exports = OAuth2Adapter;