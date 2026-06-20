const fs = require('fs/promises');
const path = require('path');
const BaseFilter = require('./BaseFilter');

// esto es exclusiva y unicamente para: leer el archivo desde la carpeta archivos_prueba 
class FileReaderFilter extends BaseFilter {
    async handle(context) {

        if (context.contenidoArchivo) {
            context.rutaArchivo = 'archivo recibido desde frontend';
            return this.next(context);
        }

        const rutaArchivo = path.join(
            __dirname,
            '../../archivos_prueba',
            context.nombreArchivo
        );

        try {
            // Se lee el contenido del archivo como texto
            context.contenidoArchivo = await fs.readFile(rutaArchivo, 'utf8');
            context.rutaArchivo = rutaArchivo;

            return this.next(context);

        } catch (error) {
            throw new Error(`No se pudo leer el archivo: ${context.nombreArchivo}`);
        }

    }

}

module.exports = FileReaderFilter;