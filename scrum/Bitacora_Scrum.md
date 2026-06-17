# Bitácora de Trabajo Arquitectónico — Fase 2 (Sprint MVP)

**Proyecto:** Plataforma Regional de Certificación de Competencias Digitales (PRCCD)
**Grupo:** 5 — AYD2 Sección P
**Sprint:** Único (lunes 15/06 — viernes 19/06/2026)
**Scrum Master:** Aída Alejandra Mansilla Orantes (202100239)

---

## 1. Sprint Planning y Gestión del Backlog

### 1.1 Objetivo del Sprint

Materializar en código funcional los 5 flujos críticos definidos en el DDA de la Fase 1:
ingesta de datos universitarios, motor de examen adaptativo, módulo antifraude, emisión
de certificado inmutable y dashboard analítico con métricas anonimizadas.

### 1.2 Sprint Backlog

> Tabla formal de los elementos seleccionados para este Sprint, indicando qué observación
> o feedback de la Fase 1 resuelve cada tarea.

#### 1.2.1 Correcciones de Fase 1 (realizadas previo al inicio del Sprint — estado: Done)

> El enunciado establece que los ajustes derivados del feedback de la Fase 1 deben
> realizarse **antes o durante** la codificación. Estas correcciones se completaron
> antes del Sprint Planning de hoy, por lo que ingresan al tablero directamente en
> la columna **Done**.

| ID | Responsable | Tarea | Feedback recibido (Fase 1) | Estado |
|----|---|---|---|---|
| T0.1 | Kevin (202101007) | Actualizar diagrama CDU100: eliminar extend "Detectar existencia de fraude", cambiar "Adecuar dificultad" de extend a include, agregar include "Adjuntar información para auditoría" | CDU100: la detección de fraude no corresponde a este flujo, solo se almacena evidencia | Done |
| T0.2 | Kevin (202101007) | Actualizar diagrama CDU102: agregar include "Validar tipo de archivo" antes de "Ingerir Datos" | CDU102: faltaba paso explícito de validación de tipo de archivo | Done |
| T0.3 | Kevin (202101007) | Actualizar diagrama CDU103: renombrar "Verificar Auditoría de Certificaciones" a "Auditoría de Certificaciones" | CDU103: nombre redundante, indicación del auxiliar | Done |
| T0.4 | Alejandra (202100239) | Actualizar secciones 3.1 y 3.2 de Docs/Documentacion.mkd para mantener congruencia con los 3 diagramas corregidos | Congruencia interna del documento | Done |
| T0.5 | Alejandra (202100239) | Expandir RF de 6 a 25 (uno por cada elipse CDU), actualizar sección 2.1, sección 3.2 (drivers por CDU), y convertir matrices 4.1 y 4.3 de imágenes a tablas Markdown | Feedback: los RF deben corresponder a cada caso de uso identificado en los diagramas expandidos | Done |
| T0.6 | Nufio (201901444) | Actualizar diagrama de bloques: simplificar a representación con iconos más general, ya que el anterior era demasiado específico y se asemejaba a un diagrama de arquitectura detallada | Feedback: el diagrama de bloques debe ser más abstracto y representativo del sistema a nivel general | Done |

#### 1.2.2 Sprint Backlog — Desarrollo del MVP (To Do)

| ID | Responsable | Tarea | Deriva de Fase 1 / Feedback | Patrón / Driver |
|----|---|---|---|---|
| T1 | Lizz (201708997) | Diseñar y crear tablas del motor de evaluaciones + banco de preguntas | RF01 — Realizar Examen Adaptativo | — |
| T2 | Lizz (201708997) | Implementar algoritmo de examen adaptativo | RF01 — Realizar Examen Adaptativo / RF02 — Adecuar Dificultad | — |
| T3 | Lizz (201708997) | Endpoint registrar respuesta y calcular dictamen | RF04 — Almacenar Resultados Inalterables | — |
| T4 | Lizz (201708997) | Pantalla de examen (frontend) | CDU100 / RF01, RF02, RF03, RF04 | — |
| T5 | Kevin (202101007) | Diseñar y crear tablas de integración + HistorialAcademico | RF10 — Proporcionar Protocolos de Autenticación / Refactorización (tabla nueva, feedback Fase 1) | — |
| T6 | Kevin (202101007) | Implementar adaptadores LDAP/SAML/OAuth2 | RF10 — Proporcionar Protocolos de Autenticación / RF11 — Unificar Sistemas de Autenticación | Adapter |
| T7 | Kevin (202101007) | Implementar cadena de filtros de ingesta: `ValidarTipoArchivo` → `ValidarFormato` → `NormalizarDatos` → `Transformador` (JSON/XML/CSV) | RF13 — Validar Tipo de Archivo / RF14 — Ingerir Datos + CDU102 corregido (T0.2) | Chain of Responsibility |
| T8 | Kevin (202101007) | Persistir Candidato + HistorialAcademico | RF12 — Proporcionar Datos Académicos / RF14 — Ingerir Datos / RT04 | — |
| T9 | Kevin (202101007) | Pantalla de login (frontend) | CDU102 / RF10, RF11 | — |
| T10 | Ludwing (201907608) | Diseñar y crear tablas de certificación y auditoría | RF06 — Aprobar Certificado / RF07 — Emitir Certificado / RT05 | — |
| T11 | Ludwing (201907608) | Emisión de certificado con hash criptográfico | RF06 — Aprobar Certificado / RF07 — Emitir Certificado | — |
| T12 | Ludwing (201907608) | Implementar cadena de bitácora inmutable | RF09 — Almacenar en Bitácora | — |
| T13 | Ludwing (201907608) | Endpoint de verificación de auditoría + detección de fraude académico, consultando `EvidenciaAntifraude` (registrada por Allan (202010046) en T16) | RF17 — Auditoría de Certificaciones / RF18 — Validar Rastro Inmutable / RF19 — Validar Firmas / RF20 — Detectar Alteración / RF21 — Detectar Fraude + CDU103 corregido (T0.1, T0.3) | Observer (Observer) |
| T14 | Ludwing (201907608) | Pantalla de descarga de certificado (frontend) | CDU101 / RF06, RF07, RF08 | — |
| T15 | Allan (202010046) | Diseñar y crear tablas de antifraude y métricas | RF03 — Recopilar Evidencia / RF22 — Visualizar Métricas / RL02 | — |
| T16 | Allan (202010046) | Simular y persistir evidencia antifraude en `EvidenciaAntifraude` (sin lógica de detección, eso corresponde a CDU103/Ludwing (201907608) según corrección T0.1) | RF03 — Recopilar Evidencia / RF05 — Adjuntar Información para Auditoría + CDU100 corregido (T0.1) | Observer (Subject) |
| T17 | Allan (202010046) | Endpoint de métricas agregadas y anonimizadas | RF23 — Agregar y Anonimizar Datos / RF24 — Generar Dashboard Analítico / RF25 — Segmentar Información | — |
| T18 | Allan (202010046) | Implementar lado Observer (Subject → notify) | RF05 — Adjuntar Información para Auditoría / Patrón Observer | Observer |
| T19 | Allan (202010046) | Documentar contrato de endpoint de métricas para Nufio (201901444) | RF24 — Generar Dashboard Analítico / CDU104 | — |
| T20 | Nufio (201901444) | Definir estructura de navegación del portal React | CDU100-104 (frontend) / RF01, RF06, RF10, RF17, RF22 | — |
| T21 | Nufio (201901444) | Implementar Dashboard View (gráficas) | RF24 — Generar Dashboard Analítico | MVC |
| T22 | Nufio (201901444) | Implementar Dashboard Controller y Model | RF25 — Segmentar Información / RF23 — Agregar y Anonimizar Datos | MVC |
| T23 | Nufio (201901444) | Ensamblar pantallas de Lizz (201708997)/2/3 en el portal | Integración general CDU100-104 | — |
| T24 | SM | Diseñar y crear tabla CandidatoSeguridad | RF08 — Verificar Cumplimiento de Leyes de Protección de Datos / RL01, RL02 | — |
| T25 | SM | Implementar cifrado/descifrado AES (VARBINARY) | RF08 — Verificar Cumplimiento de Leyes de Protección de Datos / RL02 | — |
| T26 | SM | Implementar lógica de derecho al olvido (estado_gdpr) | RF08 — Verificar Cumplimiento de Leyes de Protección de Datos / RL01 | — |
| T27 | SM | Pantalla "Gestión de privacidad" (frontend mínimo) | RF08 — Verificar Cumplimiento de Leyes de Protección de Datos / RL01 | — |
| T28 | SM | Gestionar tablero Kanban diario | Gestión ágil | — |
| T29 | SM | Coordinar Daily Standups y documentación SCRUM | Gestión ágil | — |
| T30 | SM | Consolidar documentación SCRUM final | Gestión ágil | — |

### 1.3 Acuerdos de Sprint Planning (lunes 15/06)

> IDs y contratos fijos acordados entre el equipo para permitir trabajo en paralelo sin
> dependencias bloqueantes.

- `id_candidato = 1` → candidato ficticio usado por Lizz (201708997), Kevin (202101007), Ludwing (201907608), Allan (202010046), SM.
- `id_evaluacion = 1`, `aprobada = true` → usado por Lizz (201708997) y Ludwing (201907608) para emitir certificado.
- **Formato del endpoint de evaluación (Lizz (201708997) → Nufio (201901444)):** `GET /api/evaluacion/{id_candidato}/resultado`
  ```json
  {
    "id_evaluacion": 1,
    "id_candidato": 1,
    "calificacion": 80.00,
    "estado": "finalizada",
    "aprobada": true
  }
  ```
- **Formato del endpoint de métricas (Allan (202010046) → Nufio (201901444)):** `GET /api/metricas`
  ```json
  {
    "anonimizada": true,
    "fecha_calculo": "2026-06-19",
    "metricas": [
      {
        "id_pais": 1,
        "pais": "Guatemala",
        "carrera_segmento": "Ingeniería en Sistemas",
        "genero_segmento": "F",
        "total_evaluaciones": 120,
        "total_aprobados": 95,
        "tasa_aprobacion": 79.16
      }
    ]
  }
  ```
- **Contrato `EvidenciaAntifraude` (Allan (202010046) → Ludwing (201907608)):** acorde a la corrección T0.1 (CDU100 →
  include "Adjuntar información para auditoría"), Allan (202010046) inserta en su seed los siguientes
  registros en `EvidenciaAntifraude` con `id_evaluacion=1`. Ludwing (201907608) inserta los mismos
  registros en su propio seed y programa `AuditoriaReportes.update()` (Patrón 4 — Observer)
  contra ellos. El viernes ambos leen de la misma tabla en la BD compartida.
  ```sql
  INSERT INTO EvidenciaAntifraude (
    id_evidencia, id_evaluacion, tipo_evidencia,
    uri_almacenamiento, hash_sha256, algoritmo_cifrado,
    timestamp_captura, fecha_retencion_hasta, inmutable
  )
  VALUES (
    1, 1, 'captura',
    '/evidencias/eval1_captura.png',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    'AES-256',
    '2026-06-15 21:00:00',
    '2031-06-15',
    true
  );
  ```
  Campos acordados: `tipo_evidencia = 'captura'`, `hash_sha256` de 64 caracteres,
  `algoritmo_cifrado = 'AES-256'`, `fecha_retencion_hasta = '2031-06-15'` (5 años),
  `inmutable = true`.

### 1.4 Captura del Tablero Kanban — Inicio del Sprint

> Captura de pantalla del tablero inmediatamente antes de iniciar el desarrollo (todas las
> tarjetas en *To Do*).

![Kanban inicial](Images/kanban_inicio_sprint.png)

---

## 2. Daily Standup — Refinamiento Arquitectónico Diario

> Registro diario obligatorio por cada integrante. Cada persona responde con rigurosidad
> técnica las 3 preguntas, indicando trazabilidad con drivers, EaC o restricciones.

### Martes 16/06/2026

#### Lizz Castellanos — Dev1 Motor de Evaluaciones

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree las tablas del motor de evaluaciones y banco de preguntas (T1): `PeriodoCertificacion`, `InscripcionPeriodo`, `Competencia`, `Pregunta`, `OpcionRespuesta`, `Evaluacion`, `RespuestaEvaluacion` segun el DER de Fase 1. Resultado: schema.sql funcional en dev1-evaluaciones/.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementar el algoritmo de examen adaptativo (T2) y el endpoint para registrar respuesta y calcular dictamen aprobado/reprobado (T3), trazables con RF01, RF02 y RF04 del DDA.

3. **¿Existen impedimentos técnicos o de integración?**
   Sin impedimentos.

---

#### Kevin Santos — Dev2 Integracion e Ingesta

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree las tablas de integracion e HistorialAcademico (T5), genere los archivos de prueba JSON/XML/CSV para las tres universidades piloto (T6) y verifique el levantamiento del frontend con los puertos establecidos. Resultado: estructura de datos lista para implementar los adaptadores.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementar los adaptadores LDAP/SAML/OAuth2 con patron Adapter (T7), la cadena de filtros de ingesta con Chain of Responsibility (T8) y persistir Candidato + HistorialAcademico (T9), trazables con RF10, RF11, RF12, RF13 y RF14.

3. **¿Existen impedimentos técnicos o de integración?**
   Complicaciones con el tiempo disponible para desarrollo, se priorizaran las tareas criticas del dia.

---

#### Ludwing Lopez — Dev3 Certificacion y Auditoria

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree las tablas de certificacion y auditoria con su normalizacion (T10): `Certificado`, `BitacoraAuditoria`, `EntidadAuditora`, `VerificacionAuditoria`. Resultado: schema.sql funcional en dev3-certificacion/.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementar la validacion de rastro, firmas y deteccion de fraude con patron Observer (T13) consumiendo `EvidenciaAntifraude` registrada por Allan, y la pantalla de descarga de certificado en React (T14). Trazable con RF17, RF18, RF19, RF20 y RF21.

3. **¿Existen impedimentos técnicos o de integración?**
   Sin impedimentos.

---

#### Allan Sltan — Dev4 Antifraude y Metricas

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree las tablas de antifraude y metricas (T15): `EvidenciaAntifraude`, `DeteccionFraude`, `MetricaAgregada`. Resultado: schema.sql funcional en dev4-antifraude/.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Simular y persistir evidencia antifraude en `EvidenciaAntifraude` (T16) como Observer Subject, trazable con RF03 y RF05 del DDA.

3. **¿Existen impedimentos técnicos o de integración?**
   El tablero Kanban aparecia cerrado al intentar acceder, se resolvio en el transcurso del dia.

---

#### Geovanni Nufio — Dev5 Dashboard y Portal

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree el proyecto React con Vite + CoreUI (T20), configure el docker-compose con MySQL 8 y el servicio frontend (T22/T23) y defini la estructura de navegacion del portal. Resultado: proyecto funcional en frontend/portal-prccd/ con puertos establecidos.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementar el Dashboard View con graficas usando patron MVC Vista (T21) y el Dashboard Controller y Model (T22), trazables con RF24 y RF25.

3. **¿Existen impedimentos técnicos o de integración?**
   Sin impedimentos reportados.

---

#### Alejandra Mansilla — Scrum Master Seguridad Transversal

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Cree el schema y seed de `CandidatoSeguridad` (T24) e implemente el modulo de cifrado/descifrado AES-256-CBC usando `crypto.createCipheriv` nativo de Node sobre los campos `nombre_cifrado` y `email_cifrado` (T25), incluyendo el endpoint `POST /api/seguridad/anonimizar/{id}` para el derecho al olvido GDPR (T26). Se verifico funcionamiento con pruebas en los 3 endpoints. Resultado: backend/sm-seguridad/ funcional en puerto 4005.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementar la pantalla React de gestion de privacidad con CoreUI con boton "Solicitar olvido" (T27), trazable con RF08 y RL01 del DDA. Coordinar dailies y documentacion SCRUM (T28/T29).

3. **¿Existen impedimentos técnicos o de integración?**
   Docker Desktop no inicio correctamente, se resolvio usando MySQL local con Workbench para las pruebas del modulo de seguridad.

---

### Miércoles 17/06/2026

#### Lizz Castellanos — Dev1 Motor de Evaluaciones
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Kevin Santos — Dev2 Integracion e Ingesta
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Ludwing Lopez — Dev3 Certificacion y Auditoria
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Allan Sltan — Dev4 Antifraude y Metricas
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Geovanni Nufio — Dev5 Dashboard y Portal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Alejandra Mansilla — Scrum Master Seguridad Transversal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

### Jueves 18/06/2026

#### Lizz Castellanos — Dev1 Motor de Evaluaciones
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Kevin Santos — Dev2 Integracion e Ingesta
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Ludwing Lopez — Dev3 Certificacion y Auditoria
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Allan Sltan — Dev4 Antifraude y Metricas
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Geovanni Nufio — Dev5 Dashboard y Portal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Alejandra Mansilla — Scrum Master Seguridad Transversal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

### Viernes 19/06/2026

#### Lizz Castellanos — Dev1 Motor de Evaluaciones
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Kevin Santos — Dev2 Integracion e Ingesta
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Ludwing Lopez — Dev3 Certificacion y Auditoria
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Allan Sltan — Dev4 Antifraude y Metricas
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Geovanni Nufio — Dev5 Dashboard y Portal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

#### Alejandra Mansilla — Scrum Master Seguridad Transversal
1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   -
2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   -
3. **¿Existen impedimentos técnicos o de integración?**
   -

---

## 3. Sprint Retrospective e Impacto Estructural

> Al finalizar la iteración, cada integrante responde de forma honesta.

### Lizz Castellanos — Dev1 Motor de Evaluaciones

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

### Kevin Santos — Dev2 Integracion e Ingesta

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

### Ludwing Lopez — Dev3 Certificacion y Auditoria

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

### Allan Sltan — Dev4 Antifraude y Metricas

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

### Geovanni Nufio — Dev5 Dashboard y Portal

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

### Alejandra Mansilla — Scrum Master Seguridad Transversal

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código real?**
  -
- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas, cuellos de botella o requirieron refactorización de emergencia?**
  -
- **¿Qué mejoras técnicas concretas se proponen para la mantenibilidad futura del ecosistema?**
  -

---

## 4. Cierre del Sprint

### 4.1 Captura del Tablero Kanban — Cierre del Sprint

> Captura de pantalla del tablero en su estado final (todas las tareas en *Done* o
> debidamente justificadas en *Blocked*).

![Kanban final](Images/kanban_cierre_sprint.png)

### 4.2 Burndown Chart / Resumen de Tareas

| Día | Tareas pendientes | Tareas completadas | Justificación (si aplica) |
|---|---|---|---|
| Lunes 15/06 | 38 | 0 | Sprint Planning, todo en To Do (5 correcciones Done + 33 en To Do) |
| Martes 16/06 | | | |
| Miércoles 17/06 | | | |
| Jueves 18/06 | | | |
| Viernes 19/06 | | | |

---

## 5. Aplicación de Feedback de la Fase 1

> Resumen de los ajustes arquitectónicos realizados durante esta fase como resultado de
> la retroalimentación recibida en la calificación del DDA.

| Observación recibida (Fase 1) | Ajuste aplicado en Fase 2 | Responsable |
|---|---|---|
| Diferenciación Adapter vs Facade poco clara | Facade (`FachadaIntegracion`) ahora expone interfaz de alto nivel separada de los adaptadores LDAP/SAML/OAuth2 | Kevin (202101007) / SM |
| Pipes and Filters no es estrictamente GoF | Sustituido por Chain of Responsibility en el pipeline de ingesta | Kevin (202101007) |
| Falta entidad para historial académico de candidatos | Se agrega tabla `HistorialAcademico` al DER | Kevin (202101007) |
| CDU100: "Detectar existencia de fraude" no corresponde a este flujo — en Realizar Examen Adaptativo solo se almacena evidencia, la detección ocurre en otro proceso | Se elimina el extend "Detectar existencia de fraude" de CDU100. Se agrega include "Adjuntar información para auditoría" que conecta CDU100 → CDU103. "Adecuar dificultad" pasa de extend a include (siempre se ejecuta). | Kevin (202101007) |
| CDU102: faltaba un paso explícito de validación de tipo de archivo antes de ingerir datos | Se agrega include "Validar tipo de archivo" como nuevo paso previo a "Ingerir Datos". Se implementa como filtro `ValidarTipoArchivo`, primer eslabón de la cadena de Chain of Responsibility. | Kevin (202101007) |
| CDU103: el nombre "Verificar Auditoría de Certificaciones" era redundante, por indicación del auxiliar | Se renombra a "Auditoría de Certificaciones". Aquí se centraliza la detección de fraude académico, recibiendo la evidencia adjuntada desde CDU100. | Kevin (202101007) |
| Los RF debían corresponder a cada elipse (caso de uso) de los diagramas CDU expandidos, no agruparse en 6 RF de alto nivel | Se expanden de 6 a 25 RF, uno por cada elipse identificada en los diagramas CDU100-CDU104. Se actualizan las secciones 2.1, 3.2, 4.1 y 4.3 del Documentacion.mkd. Las matrices de trazabilidad se convierten de imágenes a tablas Markdown. | Alejandra / SM (202100239) |
| El diagrama de bloques era demasiado específico y se asemejaba a un diagrama de arquitectura detallada | Se actualiza a una representación más general con iconos, manteniendo la visión de alto nivel de las capas del sistema sin exponer detalles de implementación. | Alejandra / SM (202100239) |