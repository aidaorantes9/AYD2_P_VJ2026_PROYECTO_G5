const { crearCadenaIngesta } = require('../filters/IngestionChain');

// Controlador para probar la cadena de filtros de ingesta
async function procesarArchivo(req, res) {

    try {

        const { nombre_archivo } = req.body;

        if (!nombre_archivo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El campo nombre_archivo es obligatorio'
            });
        }

        // Se crea el contexto inicial que pasará por toda la cadena
        const contextoInicial = {
            nombreArchivo: nombre_archivo
        };

        // Se construye y ejecuta la cadena de filtros
        const cadena = crearCadenaIngesta();
        const resultado = await cadena.handle(contextoInicial);

        // asi es como debe responder al probar con postman luego de va 
        return res.json({

            ok: true,
            modulo: 'Integracion e Ingesta',
            patron: 'Chain of Responsibility',
            archivo: nombre_archivo,
            formato_datos: resultado.formato_datos,
            total_candidatos: resultado.datosNormalizados.candidatos.length,
            datos_normalizados: resultado.datosNormalizados

        });

    } catch (error) {
        
        return res.status(400).json({
            ok: false,
            mensaje: error.message
        });

    }
}

module.exports = {
    procesarArchivo
};