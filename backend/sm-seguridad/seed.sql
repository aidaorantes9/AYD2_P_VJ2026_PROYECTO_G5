USE prccd;

INSERT INTO CandidatoSeguridad (id, nombre_cifrado, email_cifrado, estado_gdpr) VALUES
  (1, UNHEX('7727c36a13e42d8680743d4c6ed084e0'), UNHEX('7ad7bf97e9ab8dd187d790ecd101cf4f62e87f9b4c967845009c716b2e11d219'), 'activo'),
  (2, UNHEX('793acb153d36dd0944a1a92b7f492261'), UNHEX('dd79c4f856a9a06013fb78c448b57e66ea4f79760c4f49b0c70de904f424b47e'), 'activo'),
  (3, UNHEX('0233e2cc670d1be90c5dafc3cf6a6045'), UNHEX('b6d1aa732d9d0a24ebbd376d98a33b62835a2ea5c1d43e839cb5ae029a9dff7b'), 'activo'),
  (4, UNHEX('893fd5cc701eea36783ac6eac7e3cee3'), UNHEX('a7562f4e95c88824119c338b16f8e4efb422ca88e77e062d4654723ea0530d8a'), 'activo');

ALTER TABLE CandidatoSeguridad AUTO_INCREMENT = 5;
