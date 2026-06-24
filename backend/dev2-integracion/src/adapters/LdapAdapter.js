const BaseAuthAdapter = require('./BaseAuthAdapter')

// Adaptador para universidades que usan LDAP.
class LdapAdapter extends BaseAuthAdapter {
    async autenticar(credenciales) {
        const { usuario, password } = credenciales

        if (!usuario || !password) {
            throw this.crearError('LDAP requiere usuario y contraseña', 400)
        }

        const candidato = await this.buscarCandidatoActivo(usuario, password)

        return {
            ...this.crearRespuestaBase(candidato, 'LDAP'),
            tipo_identidad: 'directorio_institucional',
            mensaje: 'Autenticacion mediante LDAP validada contra Candidato'
        }
    }
}

module.exports = LdapAdapter