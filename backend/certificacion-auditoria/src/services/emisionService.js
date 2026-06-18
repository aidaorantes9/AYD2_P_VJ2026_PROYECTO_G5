const crypto = require('crypto');
const pool = require('../db');
const { calcularHash, calcularHashEvento } = require('../utils/hash');
const { firmarContenido } = require('../utils/firma');
const {
  cargarClavePrivada,
  cargarClavePublica,
} = require('../config/keys');
const {
  generarFechaMySQL,
} = require('./bitacoraService');

function validarSolicitud({
  idCandidato,
  idEvaluacion,
  datosCertificado,
}) {
  if (!Number.isInteger(Number(idCandidato)) || Number(idCandidato) <= 0) {
    throw new Error('El id del candidato no es válido');
  }

  if (
    idEvaluacion !== null
    && idEvaluacion !== undefined
    && (
      !Number.isInteger(Number(idEvaluacion))
      || Number(idEvaluacion) <= 0
    )
  ) {
    throw new Error('El id de la evaluación no es válido');
  }

  if (
    datosCertificado === null
    || typeof datosCertificado !== 'object'
    || Array.isArray(datosCertificado)
  ) {
    throw new Error('Los datos del certificado deben ser un objeto JSON');
  }

  if (datosCertificado.resultado !== 'APROBADO') {
    throw new Error(
      'Solo se puede emitir un certificado para un resultado APROBADO'
    );
  }
}

/**
 * Emite un certificado firmado y registra su primer evento
 * en la cadena de auditoría dentro de una sola transacción.
 */
async function emitirCertificado({
  idCandidato,
  idEvaluacion = null,
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
      `SELECT id_candidato
       FROM Candidato
       WHERE id_candidato = ?
       FOR UPDATE`,
      [idCandidato]
    );

    if (candidatos.length === 0) {
      const error = new Error('Candidato no encontrado');
      error.code = 'CANDIDATO_NO_ENCONTRADO';
      throw error;
    }

    const fechaEvento = generarFechaMySQL();
    const codigoVerificacion = crypto.randomUUID();

    const contenidoCertificado = {
      ...datosCertificado,
      id_candidato: Number(idCandidato),
      id_evaluacion: idEvaluacion
        ? Number(idEvaluacion)
        : null,
      codigo_verificacion: codigoVerificacion,
      fecha_emision: fechaEvento,
    };

    const hashCertificado = calcularHash(
      contenidoCertificado
    );

    const firmaElectronica = firmarContenido(
      hashCertificado,
      clavePrivada
    );

    const [certificado] = await connection.execute(
      `INSERT INTO Certificado (
        id_candidato,
        id_evaluacion,
        codigo_verificacion,
        hash_certificado,
        algoritmo_hash,
        firma_electronica,
        clave_publica,
        datos_certificado,
        fecha_emision
      ) VALUES (?, ?, ?, ?, 'SHA-256', ?, ?, ?, ?)`,
      [
        idCandidato,
        idEvaluacion,
        codigoVerificacion,
        hashCertificado,
        firmaElectronica,
        clavePublica,
        JSON.stringify(contenidoCertificado),
        fechaEvento,
      ]
    );

    const detalleEvento = {
      accion: 'Emisión de certificado digital',
      codigo_verificacion: codigoVerificacion,
      hash_certificado: hashCertificado,
    };

    const hashEvento = calcularHashEvento({
      idCertificado: certificado.insertId,
      tipoEvento: 'EMISION',
      actor,
      detalleEvento,
      resultadoValidacion: 'NO_APLICA',
      fechaEvento,
      hashAnterior: null,
    });

    const firmaEvento = firmarContenido(
      hashEvento,
      clavePrivada
    );

    const [evento] = await connection.execute(
      `INSERT INTO BitacoraAuditoria (
        id_certificado,
        tipo_evento,
        actor,
        detalle_evento,
        hash_anterior,
        hash_evento,
        firma_evento,
        resultado_validacion,
        fecha_evento
      ) VALUES (?, 'EMISION', ?, ?, NULL, ?, ?, 'NO_APLICA', ?)`,
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
      id_certificado: certificado.insertId,
      id_evento: evento.insertId,
      codigo_verificacion: codigoVerificacion,
      hash_certificado: hashCertificado,
      firma_electronica: firmaElectronica,
      fecha_emision: fechaEvento,
      estado: 'emitido',
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
