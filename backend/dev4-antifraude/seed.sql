-- Selecciona la base de datos del proyecto
USE prccd;

-- Limpia datos previos respetando dependencias entre tablas
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE EvidenciaAntifraude;
TRUNCATE TABLE DeteccionFraude;
TRUNCATE TABLE MetricaAgregada;

SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO EvidenciaAntifraude (
    id_evaluacion, tipo_evidencia, uri_almacenamiento, hash_sha256,
    algoritmo_cifrado, timestamp_captura, fecha_retencion_hasta, inmutable
) VALUES (
    1, 'captura', '/evidencias/eval1_captura.png', 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9',
    'AES-256', '2026-06-15 10:00:00', '2031-06-15', 1
);

INSERT INTO DeteccionFraude (
    id_evaluacion, id_evidencia, tipo_indicio, descripcion,
    severidad, estado_revision, fecha_deteccion
) VALUES (
    1, 1, 'patron_tecleo_anomalo', 'Se detectó un patrón de tecleo inconsistente con el historial del candidato',
    'alta', 'pendiente', '2026-06-15 10:05:00'
);

INSERT INTO MetricaAgregada (
    id_competencia, id_pais, id_periodo, carrera_segmento,
    genero_segmento, total_evaluaciones, total_aprobados,
    tasa_aprobacion, anonimizada, fecha_calculo
) VALUES (
    1, 7, 3, 'Ingeniería',
    'F', 120, 101,
    84.17, 1, '2026-06-18 09:00:00'
);