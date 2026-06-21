const db = require("../db");

async function obtenerMetricas({ pais, carrera, genero }) {
  let sql = `
    SELECT 
      ma.id_pais,
      p.nombre AS pais,
      ma.carrera_segmento,
      ma.genero_segmento,
      ma.total_evaluaciones,
      ma.total_aprobados,
      ma.tasa_aprobacion,
      ma.fecha_calculo
    FROM MetricaAgregada ma
    LEFT JOIN Pais p ON p.id_pais = ma.id_pais
    WHERE 1=1
  `;

  const params = [];

  if (pais) {
    sql += " AND p.codigo = ?";
    params.push(pais);
  }

  if (carrera) {
    sql += " AND ma.carrera_segmento LIKE ?";
    params.push(`%${carrera}%`);
  }

  if (genero) {
    sql += " AND ma.genero_segmento = ?";
    params.push(genero);
  }

  sql += " ORDER BY ma.fecha_calculo DESC";

  const [rows] = await db.query(sql, params);
  return rows;
}

module.exports = { obtenerMetricas };