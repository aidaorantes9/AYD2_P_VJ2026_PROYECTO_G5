// Se importa la clase base para reutilizar la estructura común.
const BaseAuthAdapter = require('./BaseAuthAdapter');

// Adaptador para universidades que usan LDAP.
class LdapAdapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, password } = credenciales;

        // Para esta simulación, LDAP requiere usuario y contraseña.
        if (!usuario || !password) {
            throw new Error('LDAP requiere usuario y password');
        }

        // Se devuelve una respuesta normalizada para el sistema.
        return {
            ...this.crearRespuestaBase(usuario, 'LDAP'),
            tipo_identidad: 'directorio_institucional',
            mensaje: 'Autenticacion simulada mediante LDAP completada'
        };
    }
}

module.exports = LdapAdapter;