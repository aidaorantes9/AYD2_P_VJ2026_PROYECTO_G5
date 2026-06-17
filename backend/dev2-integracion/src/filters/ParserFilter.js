const Papa = require('papaparse');
const xml2js = require('xml2js');
const BaseFilter = require('./BaseFilter');

// Convierte el contenido del archivo a un objeto JavaScript.
class ParserFilter extends BaseFilter {
    
    async handle(context) {

        if (context.formato_datos === 'JSON') {

            // JSON se maneja con JSON.parse nativo, como indica el acuerdo (del md, esto quizas lo modifique despues es solo de guia para mi)
            context.datosParseados = JSON.parse(context.contenidoArchivo);
        }

        if (context.formato_datos === 'XML') {
    
            // XML se convierte a objeto usando xml2js
            const parser = new xml2js.Parser({
                explicitArray: false,
                trim: true
            });

            context.datosParseados = await parser.parseStringPromise(context.contenidoArchivo);
    
        }

        if (context.formato_datos === 'CSV') {
    
            // CSV se convierte a arreglo de objetos usando papaparse
            const resultado = Papa.parse(context.contenidoArchivo, {
                header: true,
                skipEmptyLines: true
            });

            if (resultado.errors.length > 0) {
                throw new Error('El archivo CSV contiene errores de formato');
            }

            context.datosParseados = resultado.data;
    
        }

        return this.next(context);
    }
}

module.exports = ParserFilter;