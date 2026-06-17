// Se importa la clase base del adaptador.
const BaseAuthAdapter = require('./BaseAuthAdapter');

// Adaptador para universidades que usan SAML.
class SamlAdapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, saml_assertion } = credenciales;

        // En esta simulación, SAML acepta un usuario o una assertion simulada.
        if (!usuario && !saml_assertion) {
            throw new Error('SAML requiere usuario o saml_assertion');
        }

        // Se normaliza la respuesta para que el sistema la consuma igual que los otros protocolos.
        return {
            ...this.crearRespuestaBase(usuario || 'usuario_saml', 'SAML'),
            tipo_identidad: 'federacion_academica',
            mensaje: 'Autenticacion simulada mediante SAML completada'
        };
    }
}

module.exports = SamlAdapter;