const crypto = require('crypto');
const pool = require('../db');

const {
  calcularHash,
  calcularHashEvento,
} = require('../utils/hash');

const {
  firmarContenido,
} = require('../utils/firma');

const {
  cargarClavePrivada,
  cargarClavePublica,
} = require('../config/keys');

const {
  generarFechaMySQL,
} = require('./bitacoraService');

function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.code = codigo;
  return error;
}

function validarSolicitud({
  idCandidato,
  idEvaluacion,
  datosCertificado,
}) {
  if (
    !Number.isInteger(Number(idCandidato)) ||
    Number(idCandidato) <= 0
  ) {
    throw crearError(
      'El id del candidato no es válido',
      'SOLICITUD_INVALIDA'
    );
  }

  if (
    !Number.isInteger(Number(idEvaluacion)) ||
    Number(idEvaluacion) <= 0
  ) {
    throw crearError(
      'El id de la evaluación es obligatorio',
      'SOLICITUD_INVALIDA'
    );
  }

  if (
    datosCertificado === null ||
    typeof datosCertificado !== 'object' ||
    Array.isArray(datosCertificado)
  ) {
    throw crearError(
      'Los datos del certificado deben ser un objeto JSON',
      'SOLICITUD_INVALIDA'
    );
  }
}

async function buscarCertificadoExistente(
  connection,
  idEvaluacion
) {
  const [certificados] = await connection.execute(
    `
    SELECT
      id_certificado,
      codigo_verificacion,
      hash_certificado,
      firma_electronica,
      fecha_emision,
      estado
    FROM Certificado
    WHERE id_evaluacion = ?
    ORDER BY id_certificado DESC
    LIMIT 1
    `,
    [idEvaluacion]
  );

  if (certificados.length === 0) {
    return null;
  }

  const certificado = certificados[0];

  const [eventos] = await connection.execute(
    `
    SELECT id_evento
    FROM BitacoraAuditoria
    WHERE id_certificado = ?
      AND tipo_evento = 'EMISION'
    ORDER BY id_evento
    LIMIT 1
    `,
    [certificado.id_certificado]
  );

  return {
    id_certificado: certificado.id_certificado,
    id_evento: eventos[0]?.id_evento || null,
    codigo_verificacion:
      certificado.codigo_verificacion,
    hash_certificado:
      certificado.hash_certificado,
    firma_electronica:
      certificado.firma_electronica,
    fecha_emision:
      certificado.fecha_emision,
    estado: certificado.estado,
    reutilizado: true,
  };
}

/**
 * Emite un certificado únicamente cuando:
 * - la evaluación pertenece al candidato;
 * - está finalizada y aprobada;
 * - el candidato está activo en GDPR;
 * - todavía no existe un certificado para esa evaluación.
 */
async function emitirCertificado({
  idCandidato,
  idEvaluacion,
  datosCertificado,
  actor = 'Sistema PRCCD',
}) {
  validarSolicitud({
    idCandidato,
    idEvaluacion,
    datosCertificado,
  });

  const clavePrivada = cargarClavePrivada();
  const clavePublica = cargarClavePublica();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [candidatos] = await connection.execute(
      `
      SELECT id_candidato
      FROM Candidato
      WHERE id_candidato = ?
      FOR UPDATE
      `,
      [idCandidato]
    );

    if (candidatos.length === 0) {
      throw crearError(
        'Candidato no encontrado',
        'CANDIDATO_NO_ENCONTRADO'
      );
    }

    const [evaluaciones] = await connection.execute(
      `
      SELECT
        e.id_evaluacion,
        e.id_candidato,
        e.calificacion,
        e.estado,
        e.aprobada,
        c.nombre AS competencia
      FROM Evaluacion e
      INNER JOIN Competencia c
        ON c.id_competencia = e.id_competencia
      WHERE e.id_evaluacion = ?
        AND e.id_candidato = ?
      FOR UPDATE
      `,
      [
        idEvaluacion,
        idCandidato,
      ]
    );

    if (evaluaciones.length === 0) {
      throw crearError(
        'La evaluación no existe o no pertenece al candidato',
        'EVALUACION_NO_ENCONTRADA'
      );
    }

    const evaluacion = evaluaciones[0];

    const aprobada =
      evaluacion.aprobada === true ||
      evaluacion.aprobada === 1;

    if (
      evaluacion.estado !== 'finalizada' ||
      !aprobada
    ) {
      throw crearError(
        'La evaluación debe estar finalizada y aprobada',
        'EVALUACION_NO_APROBADA'
      );
    }

    const [seguridad] = await connection.execute(
      `
      SELECT estado_gdpr
      FROM CandidatoSeguridad
      WHERE id = ?
      FOR UPDATE
      `,
      [idCandidato]
    );

    if (seguridad.length === 0) {
      throw crearError(
        'No existe información de cumplimiento GDPR para el candidato',
        'GDPR_NO_ENCONTRADO'
      );
    }

    if (seguridad[0].estado_gdpr !== 'activo') {
      throw crearError(
        'No se puede emitir un certificado para un candidato olvidado o anonimizado',
        'GDPR_NO_ACTIVO'
      );
    }

    const existente =
      await buscarCertificadoExistente(
        connection,
        idEvaluacion
      );

    if (existente) {
      await connection.commit();
      return existente;
    }

    const fechaEvento = generarFechaMySQL();
    const codigoVerificacion = crypto.randomUUID();

    /*
     * La calificación, competencia y resultado se obtienen
     * directamente de la base de datos. El frontend no puede
     * alterar esos valores.
     */
    const contenidoCertificado = {
      ...datosCertificado,
      id_candidato: Number(idCandidato),
      id_evaluacion: Number(idEvaluacion),
      competencia: evaluacion.competencia,
      calificacion: Number(
        evaluacion.calificacion
      ),
      resultado: 'APROBADO',
      codigo_verificacion:
        codigoVerificacion,
      fecha_emision: fechaEvento,
    };

    const hashCertificado = calcularHash(
      contenidoCertificado
    );

    const firmaElectronica = firmarContenido(
      hashCertificado,
      clavePrivada
    );

    const [certificado] =
      await connection.execute(
        `
        INSERT INTO Certificado (
          id_candidato,
          id_evaluacion,
          codigo_verificacion,
          hash_certificado,
          algoritmo_hash,
          firma_electronica,
          clave_publica,
          datos_certificado,
          fecha_emision
        )
        VALUES (
          ?, ?, ?, ?, 'SHA-256',
          ?, ?, ?, ?
        )
        `,
        [
          idCandidato,
          idEvaluacion,
          codigoVerificacion,
          hashCertificado,
          firmaElectronica,
          clavePublica,
          JSON.stringify(
            contenidoCertificado
          ),
          fechaEvento,
        ]
      );

    const detalleEvento = {
      accion:
        'Emisión automática de certificado digital',
      codigo_verificacion:
        codigoVerificacion,
      hash_certificado:
        hashCertificado,
      id_evaluacion:
        Number(idEvaluacion),
    };

    const hashEvento = calcularHashEvento({
      idCertificado:
        certificado.insertId,
      tipoEvento: 'EMISION',
      actor,
      detalleEvento,
      resultadoValidacion:
        'NO_APLICA',
      fechaEvento,
      hashAnterior: null,
    });

    const firmaEvento = firmarContenido(
      hashEvento,
      clavePrivada
    );

    const [evento] =
      await connection.execute(
        `
        INSERT INTO BitacoraAuditoria (
          id_certificado,
          tipo_evento,
          actor,
          detalle_evento,
          hash_anterior,
          hash_evento,
          firma_evento,
          resultado_validacion,
          fecha_evento
        )
        VALUES (
          ?, 'EMISION', ?, ?,
          NULL, ?, ?, 'NO_APLICA', ?
        )
        `,
        [
          certificado.insertId,
          actor,
          JSON.stringify(detalleEvento),
          hashEvento,
          firmaEvento,
          fechaEvento,
        ]
      );

    await connection.commit();

    return {
      id_certificado:
        certificado.insertId,
      id_evento:
        evento.insertId,
      codigo_verificacion:
        codigoVerificacion,
      hash_certificado:
        hashCertificado,
      firma_electronica:
        firmaElectronica,
      fecha_emision:
        fechaEvento,
      estado: 'emitido',
      reutilizado: false,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  validarSolicitud,
  emitirCertificado,
};
