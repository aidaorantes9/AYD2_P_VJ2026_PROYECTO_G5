const pool = require('../db');
const {
  calcularHashEvento,
} = require('../utils/hash');
const {
  verificarFirma,
} = require('../utils/firma');
const {
  verificarCertificado,
} = require('./verificacionService');

function convertirJson(valor) {
  if (valor !== null && typeof valor === 'object') {
    return valor;
  }

  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

async function validarRastroAuditoria(codigoVerificacion) {
  const verificacionCertificado = await verificarCertificado(
    codigoVerificacion
  );

  const idCertificado =
    verificacionCertificado.certificado.id_certificado;

  const [certificados] = await pool.execute(
    `SELECT clave_publica
     FROM Certificado
     WHERE id_certificado = ?
     LIMIT 1`,
    [idCertificado]
  );

  const clavePublica = certificados[0].clave_publica;

  const [eventos] = await pool.execute(
    `SELECT
        id_evento,
        id_certificado,
        tipo_evento,
        actor,
        detalle_evento,
        hash_anterior,
        hash_evento,
        firma_evento,
        resultado_validacion,
        fecha_evento
     FROM BitacoraAuditoria
     WHERE id_certificado = ?
     ORDER BY id_evento ASC`,
    [idCertificado]
  );

  const anomalías = [];
  const eventosValidados = [];

  if (eventos.length === 0) {
    anomalías.push({
      tipo: 'BITACORA_VACIA',
      detalle: 'El certificado no posee eventos de auditoría',
    });
  }

  let hashPrevioEsperado = null;

  for (const evento of eventos) {
    const detalleEvento = convertirJson(
      evento.detalle_evento
    );

    if (detalleEvento === null) {
      anomalías.push({
        tipo: 'DETALLE_INVALIDO',
        id_evento: evento.id_evento,
        detalle: 'El detalle del evento no contiene JSON válido',
      });
    }

    const enlaceValido =
      evento.hash_anterior === hashPrevioEsperado;

    const hashCalculado = calcularHashEvento({
      idCertificado: evento.id_certificado,
      tipoEvento: evento.tipo_evento,
      actor: evento.actor,
      detalleEvento: detalleEvento || {},
      resultadoValidacion:
        evento.resultado_validacion,
      fechaEvento: evento.fecha_evento,
      hashAnterior: evento.hash_anterior,
    });

    const hashValido =
      hashCalculado === evento.hash_evento;

    const firmaValida = verificarFirma(
      evento.hash_evento,
      evento.firma_evento,
      clavePublica
    );

    if (!enlaceValido) {
      anomalías.push({
        tipo: 'CADENA_ROTA',
        id_evento: evento.id_evento,
        detalle:
          'El hash anterior no coincide con el evento precedente',
      });
    }

    if (!hashValido) {
      anomalías.push({
        tipo: 'HASH_EVENTO_INVALIDO',
        id_evento: evento.id_evento,
        detalle:
          'El contenido almacenado no corresponde al hash del evento',
      });
    }

    if (!firmaValida) {
      anomalías.push({
        tipo: 'FIRMA_EVENTO_INVALIDA',
        id_evento: evento.id_evento,
        detalle:
          'La firma electrónica del evento no pudo validarse',
      });
    }

    eventosValidados.push({
      id_evento: evento.id_evento,
      tipo_evento: evento.tipo_evento,
      actor: evento.actor,
      fecha_evento: evento.fecha_evento,
      resultado_validacion: evento.resultado_validacion,
      hash_anterior: evento.hash_anterior,
      hash_evento: evento.hash_evento,
      enlace_valido: enlaceValido,
      hash_valido: hashValido,
      firma_valida: firmaValida,
    });

    hashPrevioEsperado = evento.hash_evento;
  }

  const fraudeDetectado =
    !verificacionCertificado.valido
    || anomalías.length > 0;

  return {
    valido: !fraudeDetectado,
    fraude_detectado: fraudeDetectado,
    certificado:
      verificacionCertificado.certificado,
    integridad_certificado:
      verificacionCertificado.verificacion,
    total_eventos: eventos.length,
    eventos: eventosValidados,
    anomalias: anomalías,
  };
}

module.exports = {
  convertirJson,
  validarRastroAuditoria,
};
