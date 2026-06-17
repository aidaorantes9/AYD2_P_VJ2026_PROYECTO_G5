// Clase base para definir el comportamiento común de los adaptadores
// No se usa directamente, solo sirve como plantilla
class BaseAuthAdapter {

    constructor(universidad) {
    
        // Se guarda la universidad porque de ahí viene el protocolo y formato de datos
        this.universidad = universidad;
    
    }

    // Cada adaptador concreto debe implementar su propia autenticación.
    async autenticar() {
    
        throw new Error('El metodo autenticar debe ser implementado por cada adaptador');
    
    }

    // Método común para devolver una respuesta uniforme sin importar el protocolo.
    crearRespuestaBase(usuario, protocolo) {
    
        return {
            autenticado: true,
            protocolo_usado: protocolo,
            id_universidad: this.universidad.id_universidad,
            universidad: this.universidad.nombre,
            formato_datos: this.universidad.formato_datos,
            usuario_externo: usuario,
            fecha_autenticacion: new Date().toISOString()
        };
    
    }
}

module.exports = BaseAuthAdapter;