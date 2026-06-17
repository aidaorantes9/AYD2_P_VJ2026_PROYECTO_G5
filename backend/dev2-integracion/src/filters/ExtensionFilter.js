const path = require('path');
const BaseFilter = require('./BaseFilter');

// Valida que el archivo tenga una extensión soportada
class ExtensionFilter extends BaseFilter {
    
    async handle(context) {
    
        const extension = path.extname(context.nombreArchivo).toLowerCase();

        // Solo se aceptan los formatos indicados para lo que se menciona del enunciado 
        // los cuales son estos verdad: 
        const formatosPermitidos = {
            '.json': 'JSON',
            '.xml': 'XML',
            '.csv': 'CSV'
        }; // ojo cuidado con eso 

        if (!formatosPermitidos[extension]) {
            throw new Error('Formato no soportado. Solo se permite JSON, XML o CSV');
        }

        // Se guarda el formato detectado para usarlo en filtros posteriores
        context.extension = extension;
        context.formato_datos = formatosPermitidos[extension];

        return this.next(context);
    
    }
}

module.exports = ExtensionFilter;