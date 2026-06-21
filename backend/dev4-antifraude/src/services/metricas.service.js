const db = require('../db')

function construirFiltros({
  pais,
  carrera,
  genero,
  anio,
}) {
  const condiciones = [
    "e.estado = 'finalizada'",
  ]

  const parametros = []

  if (pais) {
    condiciones.push(
      'p.codigo_iso = ?'
    )
    parametros.push(pais)
  }

  if (carrera) {
    condiciones.push(
      'ca.nombre LIKE ?'
    )
    parametros.push(`%${carrera}%`)
  }

  if (genero) {
    condiciones.push(
      'c.genero = ?'
    )
    parametros.push(genero)
  }

  if (anio) {
    condiciones.push(`
      YEAR(
        COALESCE(
          e.fecha_fin,
          e.fecha_inicio
        )
      ) = ?
    `)

    parametros.push(Number(anio))
  }

  return {
    where: condiciones.join(' AND '),
    parametros,
  }
}

async function obtenerMetricas(filtros = {}) {
  const {
    where,
    parametros,
  } = construirFiltros(filtros)

  const [metricas] = await db.query(
    `
    SELECT
      p.id_pais,
      p.codigo_iso AS codigo_pais,
      p.nombre AS pais,

      COALESCE(
        ca.nombre,
        'Sin carrera registrada'
      ) AS carrera_segmento,

      COALESCE(
        NULLIF(c.genero, ''),
        'No especificado'
      ) AS genero_segmento,

      COUNT(*) AS total_evaluaciones,

      SUM(
        CASE
          WHEN e.aprobada = TRUE
            THEN 1
          ELSE 0
        END
      ) AS total_aprobados,

      ROUND(
        (
          SUM(
            CASE
              WHEN e.aprobada = TRUE
                THEN 1
              ELSE 0
            END
          ) * 100.0
        ) / COUNT(*),
        2
      ) AS tasa_aprobacion,

      MAX(
        COALESCE(
          e.fecha_fin,
          e.fecha_inicio
        )
      ) AS fecha_calculo

    FROM Evaluacion e

    INNER JOIN Candidato c
      ON c.id_candidato =
         e.id_candidato

    LEFT JOIN Pais p
      ON p.id_pais = c.id_pais

    LEFT JOIN Carrera ca
      ON ca.id_carrera =
         c.id_carrera

    WHERE ${where}

    GROUP BY
      p.id_pais,
      p.codigo_iso,
      p.nombre,
      ca.nombre,
      c.genero

    ORDER BY
      p.nombre,
      ca.nombre,
      c.genero
    `,
    parametros
  )

  const [resumen] = await db.query(
    `
    SELECT
      COUNT(*) AS
        evaluaciones_realizadas,

      SUM(
        CASE
          WHEN e.aprobada = TRUE
            THEN 1
          ELSE 0
        END
      ) AS
        evaluaciones_aprobadas,

      COUNT(
        DISTINCT cert.id_certificado
      ) AS certificados_emitidos

    FROM Evaluacion e

    INNER JOIN Candidato c
      ON c.id_candidato =
         e.id_candidato

    LEFT JOIN Pais p
      ON p.id_pais = c.id_pais

    LEFT JOIN Carrera ca
      ON ca.id_carrera =
         c.id_carrera

    LEFT JOIN Certificado cert
      ON cert.id_evaluacion =
         e.id_evaluacion

    WHERE ${where}
    `,
    parametros
  )

  const [fraude] = await db.query(
    `
    SELECT
      COUNT(
        DISTINCT d.id_deteccion
      ) AS total_alertas,

      COUNT(
        DISTINCT d.id_evaluacion
      ) AS evaluaciones_con_alerta

    FROM DeteccionFraude d

    INNER JOIN Evaluacion e
      ON e.id_evaluacion =
         d.id_evaluacion

    INNER JOIN Candidato c
      ON c.id_candidato =
         e.id_candidato

    LEFT JOIN Pais p
      ON p.id_pais = c.id_pais

    LEFT JOIN Carrera ca
      ON ca.id_carrera =
         c.id_carrera

    WHERE ${where}
    `,
    parametros
  )

  const [tendencia] = await db.query(
    `
    SELECT
      YEAR(
        d.fecha_deteccion
      ) AS anio,

      MONTH(
        d.fecha_deteccion
      ) AS mes,

      DATE_FORMAT(
        d.fecha_deteccion,
        '%Y-%m'
      ) AS periodo,

      COUNT(*) AS alertas

    FROM DeteccionFraude d

    INNER JOIN Evaluacion e
      ON e.id_evaluacion =
         d.id_evaluacion

    INNER JOIN Candidato c
      ON c.id_candidato =
         e.id_candidato

    LEFT JOIN Pais p
      ON p.id_pais = c.id_pais

    LEFT JOIN Carrera ca
      ON ca.id_carrera =
         c.id_carrera

    WHERE ${where}

    GROUP BY
      YEAR(d.fecha_deteccion),
      MONTH(d.fecha_deteccion),
      DATE_FORMAT(
        d.fecha_deteccion,
        '%Y-%m'
      )

    ORDER BY
      anio,
      mes
    `,
    parametros
  )

  const [anios] = await db.query(`
    SELECT DISTINCT
      YEAR(
        COALESCE(
          fecha_fin,
          fecha_inicio
        )
      ) AS anio

    FROM Evaluacion

    WHERE estado = 'finalizada'

    ORDER BY anio DESC
  `)

  const evaluaciones =
    Number(
      resumen[0]
        ?.evaluaciones_realizadas || 0
    )

  const aprobadas =
    Number(
      resumen[0]
        ?.evaluaciones_aprobadas || 0
    )

  const evaluacionesConAlerta =
    Number(
      fraude[0]
        ?.evaluaciones_con_alerta || 0
    )

  return {
    metricas,

    kpis: {
      evaluaciones_realizadas:
        evaluaciones,

      evaluaciones_aprobadas:
        aprobadas,

      certificados_emitidos:
        Number(
          resumen[0]
            ?.certificados_emitidos || 0
        ),

      tasa_aprobacion:
        evaluaciones > 0
          ? Number(
              (
                aprobadas *
                100 /
                evaluaciones
              ).toFixed(2)
            )
          : 0,

      total_alertas:
        Number(
          fraude[0]
            ?.total_alertas || 0
        ),

      alertas_fraude_pct:
        evaluaciones > 0
          ? Number(
              (
                evaluacionesConAlerta *
                100 /
                evaluaciones
              ).toFixed(2)
            )
          : 0,
    },

    tendencia_alertas_fraude:
      tendencia,

    anios_disponibles:
      anios
        .map((fila) => fila.anio)
        .filter(Boolean),

    fecha_calculo:
      metricas[0]
        ?.fecha_calculo || null,
  }
}

module.exports = {
  obtenerMetricas,
}
