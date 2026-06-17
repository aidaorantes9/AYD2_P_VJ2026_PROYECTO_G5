// Clase base para todos los filtros de la cadena
// Permite enlazar un filtro con el siguiente
class BaseFilter {

    constructor() {
        this.nextFilter = null;
    }

    // Define cuál será el siguiente filtro en la cadena
    setNext(filter) {

        this.nextFilter = filter;
        return filter;

    }

    // Ejecuta el siguiente filtro si existe
    async next(context) {

        if (this.nextFilter) {
            return this.nextFilter.handle(context);
        }

        return context;
    }

    // Cada filtro concreto debe implementar su propio handle
    async handle() {

        throw new Error('El metodo handle debe ser implementado por cada filtro');

    }

}

module.exports = BaseFilter;