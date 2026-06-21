const {
  obtenerMetricas,
} = require('../services/metricas.service')

async function getMetricas(req, res) {
  try {
    const {
      pais,
      carrera,
      genero,
      anio,
    } = req.query

    const data =
      await obtenerMetricas({
        pais,
        carrera,
        genero,
        anio,
      })

    return res.json({
      anonimizada: true,

      fecha_calculo:
        data.fecha_calculo,

      metricas:
        data.metricas.map(
          (item) => ({
            id_pais:
              item.id_pais,

            codigo_pais:
              item.codigo_pais,

            pais:
              item.pais,

            carrera_segmento:
              item.carrera_segmento,

            genero_segmento:
              item.genero_segmento,

            total_evaluaciones:
              Number(
                item.total_evaluaciones
              ),

            total_aprobados:
              Number(
                item.total_aprobados
              ),

            tasa_aprobacion:
              Number(
                item.tasa_aprobacion
              ),
          })
        ),

      kpis: data.kpis,

      tendencia_alertas_fraude:
        data.tendencia_alertas_fraude
          .map((item) => ({
            anio:
              Number(item.anio),

            mes:
              Number(item.mes),

            periodo:
              item.periodo,

            alertas:
              Number(item.alertas),
          })),

      anios_disponibles:
        data.anios_disponibles,
    })
  } catch (error) {
    console.error(
      'ERROR MÉTRICAS:',
      error
    )

    return res.status(500).json({
      message:
        'Error al obtener métricas',

      error:
        error.message,
    })
  }
}

module.exports = {
  getMetricas,
}
