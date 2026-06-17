// Se importan los adaptadores disponibles
const LdapAdapter = require('./LdapAdapter');
const SamlAdapter = require('./SamlAdapter');
const OAuth2Adapter = require('./OAuth2Adapter');

// Esta fábrica decide qué adaptador usar según el protocolo de la universidad
class AdapterFactory {
    static crear(universidad) {
        // El protocolo viene desde la tabla Universidad, campo protocolo_auth
        switch (universidad.protocolo_auth) {
            case 'LDAP':
                return new LdapAdapter(universidad);

            case 'SAML':
                return new SamlAdapter(universidad);

            case 'OAuth2':
                return new OAuth2Adapter(universidad);

            default:
                throw new Error(`Protocolo no soportado: ${universidad.protocolo_auth}`);
        }
    }
}

module.exports = AdapterFactory;