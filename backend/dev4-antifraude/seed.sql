USE prccd;


INSERT INTO EvidenciaAntifraude (
    id_evaluacion,
    tipo_evidencia,
    uri_almacenamiento,
    hash_sha256,
    algoritmo_cifrado,
    timestamp_captura,
    fecha_retencion_hasta,
    inmutable
)
SELECT
    1,
    'captura',
    '/evidencias/eval1_captura.png',
    'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9',
    'SHA-256',
    '2026-06-15 10:00:00',
    '2031-06-15',
    TRUE
WHERE EXISTS (
    SELECT 1
    FROM Evaluacion
    WHERE id_evaluacion = 1
)
AND NOT EXISTS (
    SELECT 1
    FROM EvidenciaAntifraude
    WHERE id_evaluacion = 1
      AND uri_almacenamiento =
          '/evidencias/eval1_captura.png'
);


INSERT INTO DeteccionFraude (
    id_evaluacion,
    id_evidencia,
    tipo_indicio,
    descripcion,
    severidad,
    estado_revision,
    fecha_deteccion
)
SELECT
    e.id_evaluacion,
    e.id_evidencia,
    'patron_tecleo_anomalo',
    'Se detectó un patrón de tecleo inconsistente con el historial del candidato',
    'alta',
    'pendiente',
    '2026-06-15 10:05:00'
FROM EvidenciaAntifraude e
WHERE e.id_evaluacion = 1
  AND e.uri_almacenamiento =
      '/evidencias/eval1_captura.png'
  AND NOT EXISTS (
      SELECT 1
      FROM DeteccionFraude d
      WHERE d.id_evidencia = e.id_evidencia
        AND d.tipo_indicio =
            'patron_tecleo_anomalo'
  );