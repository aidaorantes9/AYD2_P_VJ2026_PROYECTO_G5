const BaseFilter = require('./BaseFilter');

// Valida que la información normalizada tenga los campos mínimos requeridos
class CamposRequeridosFilter extends BaseFilter {

    async handle(context) {
    
        const data = context.datosNormalizados;

        if (!data.universidad_origen || !data.nombre_universidad || !data.candidatos) {
            throw new Error('Faltan datos generales de universidad o candidatos');
        }

        if (!Array.isArray(data.candidatos) || data.candidatos.length === 0) {
            throw new Error('No se encontraron candidatos para procesar');
        }

        data.candidatos.forEach((candidato) => {
    
            if (!candidato.id_candidato || !candidato.nombre_completo || !candidato.id_externo_univ ||
                !candidato.carrera || !candidato.contrasenia || !Array.isArray(candidato.cursos_aprobados)) 
            {
                throw new Error(`El candidato ${candidato.id_candidato || 'sin id'} tiene datos incompletos`);
            }

            candidato.cursos_aprobados.forEach((curso) => {
            
                if (!curso.codigo_curso || !curso.nombre_curso || Number.isNaN(curso.nota_final)) {
            
                    throw new Error(`Curso invalido para el candidato ${candidato.id_candidato}`);
            
                }
            
            });
        });

        return this.next(context);
    }

}

module.exports = CamposRequeridosFilter;