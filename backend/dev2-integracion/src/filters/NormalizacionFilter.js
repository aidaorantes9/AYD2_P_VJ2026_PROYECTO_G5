const BaseFilter = require('./BaseFilter');

// Convierte JSON, XML o CSV a una estructura común
class NormalizacionFilter extends BaseFilter {
    async handle(context) {
        if (context.formato_datos === 'JSON') {
            context.datosNormalizados = this.normalizarJson(context.datosParseados);
        }

        if (context.formato_datos === 'XML') {
            context.datosNormalizados = this.normalizarXml(context.datosParseados);
        }

        if (context.formato_datos === 'CSV') {
            context.datosNormalizados = this.normalizarCsv(context.datosParseados);
        }

        return this.next(context);
    }

    // Normaliza archivos con estructura JSON
    normalizarJson(data) {
        
        return {
            universidad_origen: data.fuente.universidad_origen,
            nombre_universidad: data.fuente.nombre_universidad,
            pais: data.fuente.pais,
            codigo_iso: data.fuente.codigo_iso,
            protocolo_auth: data.fuente.protocolo_auth,
            formato_datos: data.fuente.formato_datos,
            candidatos: data.candidatos.map((candidato) => ({
                id_candidato: Number(candidato.id_candidato),
                id_externo_univ: candidato.id_externo_univ,
                nombre_completo: candidato.nombre_completo,
                email: candidato.email,
                genero: candidato.genero,
                carrera: candidato.carrera,
                estado_gdpr: candidato.estado_gdpr,
                cursos_aprobados: candidato.cursos_aprobados.map((curso) => ({
                    codigo_curso: curso.codigo_curso,
                    nombre_curso: curso.nombre_curso,
                    nota_final: Number(curso.nota_final)
                }))
            }))
        };

    }

    // Normaliza archivos con estructura XML
    normalizarXml(data) {

        const fuente = data.datos_academicos.fuente;
        const candidatosRaw = data.datos_academicos.candidatos.candidato;

        // xml2js devuelve objeto si solo hay un candidato, por eso se fuerza a arreglo.
        const candidatos = Array.isArray(candidatosRaw) ? candidatosRaw : [candidatosRaw];

        return {
        
            universidad_origen: fuente.universidad_origen,
            nombre_universidad: fuente.nombre_universidad,
            pais: fuente.pais,
            codigo_iso: fuente.codigo_iso,
            protocolo_auth: fuente.protocolo_auth,
            formato_datos: fuente.formato_datos,
            candidatos: candidatos.map((candidato) => {
                const cursosRaw = candidato.cursos_aprobados.curso;
                const cursos = Array.isArray(cursosRaw) ? cursosRaw : [cursosRaw];

                return {
        
                    id_candidato: Number(candidato.id_candidato),
                    id_externo_univ: candidato.id_externo_univ,
                    nombre_completo: candidato.nombre_completo,
                    email: candidato.email,
                    genero: candidato.genero,
                    carrera: candidato.carrera,
                    estado_gdpr: candidato.estado_gdpr,
                    cursos_aprobados: cursos.map((curso) => ({
                        codigo_curso: curso.codigo_curso,
                        nombre_curso: curso.nombre_curso,
                        nota_final: Number(curso.nota_final)
                    }))
        
                };
            })
        
        };
    }

    // Normaliza archivos CSV agrupando cursos por candidato.
    normalizarCsv(filas) {
 
        if (filas.length === 0) {
            throw new Error('El archivo CSV no contiene datos');
        }

        const primeraFila = filas[0];
        const candidatosMap = new Map();

        filas.forEach((fila) => {
            const idCandidato = Number(fila.id_candidato);

            // Si el candidato aún no existe en el mapa, se crea.
            if (!candidatosMap.has(idCandidato)) {

                candidatosMap.set(idCandidato, {
                    id_candidato: idCandidato,
                    id_externo_univ: fila.id_externo_univ,
                    nombre_completo: fila.nombre_completo,
                    email: fila.email,
                    genero: fila.genero,
                    carrera: fila.carrera,
                    estado_gdpr: fila.estado_gdpr,
                    cursos_aprobados: []
                });

            }

            // Cada fila del CSV representa un curso aprobado.
            candidatosMap.get(idCandidato).cursos_aprobados.push({
                codigo_curso: fila.codigo_curso,
                nombre_curso: fila.nombre_curso,
                nota_final: Number(fila.nota_final)
            });
        });

        return {

            universidad_origen: primeraFila.universidad_origen,
            nombre_universidad: primeraFila.nombre_universidad,
            pais: primeraFila.pais,
            codigo_iso: primeraFila.codigo_iso,
            protocolo_auth: primeraFila.protocolo_auth,
            formato_datos: primeraFila.formato_datos,
            candidatos: Array.from(candidatosMap.values())

        };
    }
}

module.exports = NormalizacionFilter;