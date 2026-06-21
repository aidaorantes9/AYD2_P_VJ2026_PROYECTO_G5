// Se importa la conexión a MySQL
const pool = require('../db');

const { descifrar } = require('../utils/cryptoDatos');

// Se usa papaparse para generar respuestas en formato CSV
const Papa = require('papaparse');

// Se usa xml2js para generar respuestas en formato XML
const xml2js = require('xml2js');

// Controlador para exportar el expediente académico de un candidato
async function exportarCandidato(req, res) {

    try {

        // El id del candidato viene desde la URL: /api/candidato/:id/exportar
        const { id } = req.params;

        // El formato viene desde query params: ?formato=json
        const { formato } = req.query;

        // Se valida que el endpoint reciba un id.
        if (!id) {

            return res.status(400).json({
                ok: false,
                mensaje: 'El id del candidato es obligatorio'
            });

        }

        // Se valida que el cliente indique el formato de exportación.
        if (!formato) {

            return res.status(400).json({
                ok: false,
                mensaje: 'El parametro formato es obligatorio'
            });

        }

        // Se normaliza el formato para aceptar json, JSON, xml, XML, csv o CSV.
        const formatoSolicitado = formato.toUpperCase();

        // Solo se permiten los formatos trabajados por el módulo de integración.
        if (!['JSON', 'XML', 'CSV'].includes(formatoSolicitado)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Formato no soportado. Use json, xml o csv'
            });

        }

        // Se consulta la información base del candidato y sus relaciones.
        const [candidatos] = await pool.query(
            `
            SELECT
                c.id_candidato,
                c.nombre_cifrado,
                u.nombre AS universidad_origen,
                ca.nombre AS carrera
            FROM Candidato c
            INNER JOIN Universidad u
                ON c.id_universidad = u.id_universidad
            INNER JOIN Carrera ca
                ON c.id_carrera = ca.id_carrera
            WHERE c.id_candidato = ?
            LIMIT 1
            `,
            [id]
        );

        // Si no existe el candidato, se devuelve error 404.
        if (candidatos.length === 0) {

            return res.status(404).json({
                ok: false,
                mensaje: 'Candidato no encontrado'
            });

        }

        const candidato = candidatos[0];

        const nombreCompleto = descifrar(candidato.nombre_cifrado);

        // Se consulta el historial académico del candidato.
        const [cursos] = await pool.query(
            `
            SELECT
                codigo_curso,
                nombre_curso,
                nota_final
            FROM HistorialAcademico
            WHERE id_candidato = ?
            ORDER BY codigo_curso
            `,
            [id]
        );

        // Se arma el expediente con los campos solicitados por el enunciado.
        const expediente = {

            id_candidato: candidato.id_candidato,
            nombre_completo: nombreCompleto,
            universidad_origen: candidato.universidad_origen,
            carrera: candidato.carrera,
            cursos_aprobados: cursos.map((curso) => ({
                codigo_curso: curso.codigo_curso,
                nombre_curso: curso.nombre_curso,
                nota_final: Number(curso.nota_final)
            }))

        };

        // Exportación en JSON.
        if (formatoSolicitado === 'JSON') {
            return res.json(expediente);
        }

        // Exportación en XML
        if (formatoSolicitado === 'XML') {

            const builder = new xml2js.Builder({
                rootName: 'expediente_academico',
                xmldec: {
                    version: '1.0',
                    encoding: 'UTF-8'
                }
            });

            const xml = builder.buildObject(expediente);

            res.setHeader('Content-Type', 'application/xml');
            return res.send(xml);

        }

        // Exportación en CSV
        if (formatoSolicitado === 'CSV') {

            // En CSV se genera una fila por cada curso aprobado
            const filasCsv = expediente.cursos_aprobados.map((curso) => ({
                id_candidato: expediente.id_candidato,
                nombre_completo: expediente.nombre_completo,
                universidad_origen: expediente.universidad_origen,
                carrera: expediente.carrera,
                codigo_curso: curso.codigo_curso,
                nombre_curso: curso.nombre_curso,
                nota_final: curso.nota_final
            }));

            const csv = Papa.unparse(filasCsv);

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            return res.send(csv);
        }

    } catch (error) {
    
        return res.status(500).json({
            ok: false,
            mensaje: error.message
        });
    
    }

}

module.exports = {
    exportarCandidato
};