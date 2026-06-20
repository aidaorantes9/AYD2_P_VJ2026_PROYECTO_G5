// Se importa la función que construye la cadena de filtros
const { crearCadenaIngesta } = require('../filters/IngestionChain');

// Controlador para procesar y persistir archivos académicos
async function procesarArchivo(req, res) {
    
    try {
    
        const { nombre_archivo, contenido_archivo, id_universidad } = req.body;

        // Se valida que el cliente indique qué archivo se desea procesar
        if (!nombre_archivo) {
    
            return res.status(400).json({
                ok: false,
                mensaje: 'El campo nombre_archivo es obligatorio'
            });
    
        }

        // Contexto inicial que será compartido por todos los filtros
        const contextoInicial = {
            nombreArchivo: nombre_archivo,
            contenidoArchivo: contenido_archivo,
            idUniversidad: id_universidad
        };

        // Se ejecuta la cadena completa de ingesta.
        const cadena = crearCadenaIngesta();
        const resultado = await cadena.handle(contextoInicial);

        // Se devuelve el resultado normalizado y el resumen de persistencia
        return res.json({

            ok: true,
            modulo: 'Integracion e Ingesta',
            patron: 'Chain of Responsibility',
            archivo: nombre_archivo,
            formato_datos: resultado.formato_datos,
            total_candidatos: resultado.datosNormalizados.candidatos.length,
            persistencia: resultado.persistencia,
            datos_normalizados: resultado.datosNormalizados
        
        });

    } catch (error) {
        
        // Si falla cualquier filtro, se devuelve el mensaje del error.
        return res.status(400).json({
            ok: false,
            mensaje: error.message
        });

    }

}

module.exports = {
    procesarArchivo
};