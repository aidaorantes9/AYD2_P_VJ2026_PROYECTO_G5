const pool = require('../db');
const { calcularHashEvento } = require('../utils/hash');

const TIPOS_EVENTO = new Set([
  'EMISION',
  'VERIFICACION',
  'REVOCACION',
  'DETECCION_FRAUDE',
]);

const RESULTADOS_VALIDACION = new Set([
  'VALIDO',
  'INVALIDO',
  'NO_APLICA',
]);

function generarFechaMySQL(fecha = new Date()) {
  const iso = fecha.toISOString();

  return `${iso.slice(0, 10)} ${iso.slice(11, 23)}000`;
}

function validarEvento({
  idCertificado,
  tipoEvento,
  actor,
  detalleEvento,
  firmaEvento,
  resultadoValidacion,
}) {
  if (!Number.isInteger(Number(idCertificado)) || Number(idCertificado) <= 0) {
    throw new Error('El id del certificado no es válido');
  }

  if (!TIPOS_EVENTO.has(tipoEvento)) {
    throw new Error('El tipo de evento no es válido');
  }

  if (typeof actor !== 'string' || actor.trim() === '') {
    throw new Error('El actor es requerido');
  }

  if (
    detalleEvento === null
    || typeof detalleEvento !== 'object'
    || Array.isArray(detalleEvento)
  ) {
    throw new Error('El detalle del evento debe ser un objeto JSON');
  }

  if (typeof firmaEvento !== 'string' || firmaEvento.trim() === '') {
    throw new Error('La firma del evento es requerida');
  }

  if (!RESULTADOS_VALIDACION.has(resultadoValidacion)) {
    throw new Error('El resultado de validación no es válido');
  }
}

/**
 * Registra un evento enlazándolo criptográficamente con el anterior.
 * La transacción bloquea el certificado para evitar que dos eventos
 * simultáneos generen el mismo hash anterior.
 */
async function registrarEvento({
  idCertificado,
  tipoEvento,
  actor,
  detalleEvento,
  firmaEvento,
  resultadoValidacion = 'NO_APLICA',
}) {
  validarEvento({
    idCertificado,
    tipoEvento,
    actor,
    detalleEvento,
    firmaEvento,
    resultadoValidacion,
  });

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [certificados] = await connection.execute(
      `SELECT id_certificado
       FROM Certificado
       WHERE id_certificado = ?
       FOR UPDATE`,
      [idCertificado]
    );

    if (certificados.length === 0) {
      const error = new Error('Certificado no encontrado');
      error.code = 'CERTIFICADO_NO_ENCONTRADO';
      throw error;
    }

    const [eventosAnteriores] = await connection.execute(
      `SELECT hash_evento
       FROM BitacoraAuditoria
       WHERE id_certificado = ?
       ORDER BY id_evento DESC
       LIMIT 1`,
      [idCertificado]
    );

    const hashAnterior = eventosAnteriores.length > 0
      ? eventosAnteriores[0].hash_evento
      : null;

    const fechaEvento = generarFechaMySQL();

    const hashEvento = calcularHashEvento({
      idCertificado,
      tipoEvento,
      actor: actor.trim(),
      detalleEvento,
      resultadoValidacion,
      fechaEvento,
      hashAnterior,
    });

    const [resultado] = await connection.execute(
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idCertificado,
        tipoEvento,
        actor.trim(),
        JSON.stringify(detalleEvento),
        hashAnterior,
        hashEvento,
        firmaEvento,
        resultadoValidacion,
        fechaEvento,
      ]
    );

    await connection.commit();

    return {
      id_evento: resultado.insertId,
      id_certificado: Number(idCertificado),
      tipo_evento: tipoEvento,
      hash_anterior: hashAnterior,
      hash_evento: hashEvento,
      resultado_validacion: resultadoValidacion,
      fecha_evento: fechaEvento,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  TIPOS_EVENTO,
  RESULTADOS_VALIDACION,
  generarFechaMySQL,
  registrarEvento,
};
