// Se importa la clase base para mantener la misma estructura de los filtros
const BaseFilter = require('./BaseFilter');

// Se importa el pool de MySQL para poder ejecutar consultas a la base de datos
const pool = require('../db');

const { cifrar } = require('../utils/cryptoDatos');

// Este filtro toma los datos ya normalizados y los guarda en la base de datos
class PersistenciaFilter extends BaseFilter {
    async handle(context) {
        // Se obtiene una conexión individual para manejar una transacción
        const connection = await pool.getConnection();

        try {
            // Se inicia una transacción para asegurar que todo se guarde completo o nada
            await connection.beginTransaction();

            const data = context.datosNormalizados;

            // Se busca o crea el país relacionado con la universidad origen
            const idPais = await this.obtenerOCrearPais(connection, data);

            // Se busca o crea la universidad desde donde viene el archivo
            const idUniversidad = await this.obtenerOCrearUniversidad(connection, data, idPais);

            // Se registra el proceso de ingesta del archivo procesado
            const idIngesta = await this.registrarIngesta(connection, data, idUniversidad);

            // Resumen que se devolverá al final para saber qué se persistió
            const resumen = {
                id_ingesta: idIngesta,
                candidatos_persistidos: 0,
                cursos_persistidos: 0
            };

            // Se recorre cada candidato normalizado para guardarlo en Candidato e HistorialAcademico.
            for (const candidato of data.candidatos) {
                // Se busca o crea la carrera del candidato dentro de la universidad.
                const idCarrera = await this.obtenerOCrearCarrera(
                    connection,
                    candidato.carrera,
                    idUniversidad
                );

                // Se inserta o actualiza el candidato.
                await this.guardarCandidato(
                    connection,
                    candidato,
                    idPais,
                    idCarrera,
                    idUniversidad,
                    idIngesta
                );

                // Se reemplaza el historial anterior del candidato para evitar duplicados.
                await this.guardarHistorialAcademico(connection, candidato);

                resumen.candidatos_persistidos += 1;
                resumen.cursos_persistidos += candidato.cursos_aprobados.length;
            }

            // Si todo salió bien, se confirma la transacción.
            await connection.commit();

            // Se agrega el resumen al contexto para que el controlador lo devuelva.
            context.persistencia = resumen;

            return this.next(context);

        } catch (error) {
            // Si algo falla, se deshacen todos los cambios de esta ingesta.
            await connection.rollback();

            throw new Error(`Error al persistir datos normalizados: ${error.message}`);

        } finally {
            // Siempre se libera la conexión al finalizar.
            connection.release();
        }
    }

    async obtenerOCrearPais(connection, data) {
        // Primero se intenta encontrar el país por su código ISO.
        const [paises] = await connection.query(
            `
            SELECT id_pais
            FROM Pais
            WHERE codigo_iso = ?
            LIMIT 1
            `,
            [data.codigo_iso]
        );

        if (paises.length > 0) {
            return paises[0].id_pais;
        }

        // Si no existe, se crea el país.
        const [resultado] = await connection.query(
            `
            INSERT INTO Pais (nombre, codigo_iso)
            VALUES (?, ?)
            `,
            [data.pais, data.codigo_iso]
        );

        return resultado.insertId;
    }

    async obtenerOCrearUniversidad(connection, data, idPais) {
        // Se busca la universidad por nombre para evitar crear duplicados.
        const [universidades] = await connection.query(
            `
            SELECT id_universidad
            FROM Universidad
            WHERE nombre = ?
            LIMIT 1
            `,
            [data.nombre_universidad]
        );

        if (universidades.length > 0) {
            return universidades[0].id_universidad;
        }

        // Si no existe, se crea con el protocolo y formato definidos para la integración.
        const [resultado] = await connection.query(
            `
            INSERT INTO Universidad (
                id_pais,
                nombre,
                protocolo_auth,
                formato_datos,
                endpoint_api,
                estado
            )
            VALUES (?, ?, ?, ?, NULL, 'activo')
            `,
            [
                idPais,
                data.nombre_universidad,
                data.protocolo_auth,
                data.formato_datos
            ]
        );

        return resultado.insertId;
    }

    async obtenerOCrearCarrera(connection, nombreCarrera, idUniversidad) {
        // Se busca la carrera dentro de la universidad correspondiente.
        const [carreras] = await connection.query(
            `
            SELECT id_carrera
            FROM Carrera
            WHERE nombre = ?
              AND id_universidad = ?
            LIMIT 1
            `,
            [nombreCarrera, idUniversidad]
        );

        if (carreras.length > 0) {
            return carreras[0].id_carrera;
        }

        // Si la carrera no existe, se crea.
        const [resultado] = await connection.query(
            `
            INSERT INTO Carrera (id_universidad, nombre)
            VALUES (?, ?)
            `,
            [idUniversidad, nombreCarrera]
        );

        return resultado.insertId;
    }

    async registrarIngesta(connection, data, idUniversidad) {
        // Se crea un registro de la ingesta procesada.
        const [resultado] = await connection.query(
            `
            INSERT INTO IngestaDatosAcademicos (
                id_universidad,
                formato_datos,
                estado,
                registros_procesados,
                registros_rechazados,
                detalle_errores,
                fecha_ingesta
            )
            VALUES (?, ?, 'procesada', ?, 0, NULL, CURRENT_TIMESTAMP)
            `,
            [
                idUniversidad,
                data.formato_datos,
                data.candidatos.length
            ]
        );

        return resultado.insertId;
    }

    async guardarCandidato(connection, candidato, idPais, idCarrera, idUniversidad, idIngesta) {
        // Se convierten los datos sensibles 
        const nombreCifrado = cifrar(candidato.nombre_completo);
        const emailCifrado = cifrar(candidato.email || '');

        // Se inserta el candidato o se actualiza si ya existe el id_candidato.
        await connection.query(
            `
            INSERT INTO Candidato (
                id_candidato,
                id_pais,
                id_carrera,
                id_universidad,
                id_ingesta,
                nombre_cifrado,
                email_cifrado,
                contrasenia,
                genero,
                id_externo_univ,
                fecha_registro,
                estado_gdpr
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            ON DUPLICATE KEY UPDATE
                id_pais = VALUES(id_pais),
                id_carrera = VALUES(id_carrera),
                id_universidad = VALUES(id_universidad),
                id_ingesta = VALUES(id_ingesta),
                nombre_cifrado = VALUES(nombre_cifrado),
                email_cifrado = VALUES(email_cifrado),
                contrasenia = VALUES(contrasenia),
                genero = VALUES(genero),
                id_externo_univ = VALUES(id_externo_univ),
                estado_gdpr = VALUES(estado_gdpr)
            `,
            [
                candidato.id_candidato,
                idPais,
                idCarrera,
                idUniversidad,
                idIngesta,
                nombreCifrado,
                emailCifrado,
                candidato.contrasenia,
                candidato.genero,
                candidato.id_externo_univ,
                candidato.estado_gdpr || 'activo'
            ]
        );
    }

    async guardarHistorialAcademico(connection, candidato) {
        // Se elimina el historial previo para evitar cursos duplicados al reprocesar un archivo.
        await connection.query(
            `
            DELETE FROM HistorialAcademico
            WHERE id_candidato = ?
            `,
            [candidato.id_candidato]
        );

        // Se inserta nuevamente el historial normalizado del candidato.
        for (const curso of candidato.cursos_aprobados) {
            await connection.query(
                `
                INSERT INTO HistorialAcademico (
                    id_candidato,
                    codigo_curso,
                    nombre_curso,
                    nota_final
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    candidato.id_candidato,
                    curso.codigo_curso,
                    curso.nombre_curso,
                    curso.nota_final
                ]
            );
        }
    }
}

module.exports = PersistenciaFilter;