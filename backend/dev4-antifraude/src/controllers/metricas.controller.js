const service = require("../services/metricas.service");

async function getMetricas(req, res) {
  try {
    const { pais, carrera, genero } = req.query;

    const data = await service.obtenerMetricas({ pais, carrera, genero });

    const response = {
      anonimizada: true,
      fecha_calculo: data.length ? data[0].fecha_calculo : null,
      metricas: data.map(item => ({
        id_pais: item.id_pais,
        pais: item.pais,
        carrera_segmento: item.carrera_segmento,
        genero_segmento: item.genero_segmento,
        total_evaluaciones: item.total_evaluaciones,
        total_aprobados: item.total_aprobados,
        tasa_aprobacion: Number(item.tasa_aprobacion)
      }))
    };

    res.json(response);
  } catch (err) {
    console.error("ERROR MÉTRICAS:", err);
    res.status(500).json({
      message: "Error al obtener métricas",
      error: err.message
    });
  }
}

module.exports = { getMetricas };