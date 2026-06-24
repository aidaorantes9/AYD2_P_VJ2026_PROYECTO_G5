# Bitácora de Trabajo Arquitectónico — Fase 3 (Sprint Final)

**Proyecto:** Plataforma Regional de Certificación de Competencias Digitales (PRCCD)

**Grupo:** 5 — AYD2 Sección P

**Sprint:** Único (martes 23/06 — viernes 26/06/2026)

**Scrum Master:** Aída Alejandra Mansilla Orantes (202100239)

---

## 1. Sprint Planning y Gestión del Backlog

### 1.1 Objetivo del Sprint

Evolucionar la arquitectura de la PRCCD para soportar nuevos métodos de entrada
(voz en móviles) y notificaciones en tiempo real, desplegando el sistema en una
infraestructura multi-entorno en la nube mediante un pipeline CI/CD automatizado,
sin degradar la estabilidad del MVP construido en la Fase 2.

### 1.2 Sprint Backlog

| ID | Responsable | Tarea | Driver | Estado |
|----|---|---|---|---|
| F3-01 | Alejandra (202100239) | Sprint Planning + Backlog formal en Trello | SCRUM | Done |
| F3-02 | Alejandra (202100239) | Dailies + Kanban diario en Bitacora_Scrum_F3.md | SCRUM | In Progress |
| F3-03 | Alejandra (202100239) | Retrospectiva individual + Burndown chart | SCRUM | To Do |
| F3-04 | Alejandra (202100239) | Docs pruebas + videos + CI/CD + evolución fases 1→2→3 | 4.4 Entregables | To Do |
| F3-05 | Alejandra (202100239) | 5 pruebas unitarias automatizadas | 4.3 Pruebas | To Do |
| F3-06 | Alejandra (202100239) | 3 pruebas de integración documentadas en video | 4.3 Pruebas | To Do |
| F3-07 | Alejandra (202100239) | 1 prueba de aceptación end-to-end documentada en video | 4.3 Pruebas | To Do |
| F3-08 | Alejandra (202100239) | DDA actualizado con nuevo estilo arquitectónico de voz | 4.4 DDA | To Do |
| F3-09 | Nufio (201901444) | UI grabación de voz en examen móvil (React) | 4.1 Voz | To Do |
| F3-10 | Nufio (201901444) | Envío de audio al endpoint STT de Kevin | 4.1 Voz | To Do |
| F3-11 | Nufio (201901444) | Mostrar transcripción y continuar flujo adaptativo | 4.1 Voz | To Do |
| F3-12 | Nufio (201901444) | Pipeline CI/CD en GitHub Actions (Test → Build → Deploy) | 4.4 CI/CD | To Do |
| F3-13 | Nufio (201901444) | Deploy Staging y Producción (Railway o Render) | 4.4 CI/CD | To Do |
| F3-14 | Kevin (202101007) | Endpoint recepción de audio (multipart/form-data) | 4.1 Voz | To Do |
| F3-15 | Kevin (202101007) | Integración Speech-to-Text (Whisper o Google STT) | 4.1 Voz | To Do |
| F3-16 | Kevin (202101007) | Retornar texto transcrito al motor adaptativo existente | 4.1 Voz | To Do |
| F3-17 | Kevin (202101007) | Servicio SMTP transversal (Nodemailer) | 4.2 Notificaciones | To Do |
| F3-18 | Kevin (202101007) | Email de confirmación a candidato al emitir certificado | 4.2 Notificaciones | To Do |
| F3-19 | Kevin (202101007) | Reporte consolidado por correo a universidades | 4.2 Notificaciones | To Do |
| F3-20 | Kevin (202101007) | Alerta a auditores por detección de fraude | 4.2 Notificaciones | To Do |
| F3-21 | Ludwing (201907608) | Dockerfiles actualizados incluyendo nuevo servicio STT | 4.4 CI/CD | To Do |
| F3-22 | Ludwing (201907608) | docker-compose para Staging y Producción | 4.4 CI/CD | To Do |
| F3-23 | Ludwing (201907608) | Trigger email desde módulo de certificación (depende de F3-17) | 4.2 Notificaciones | To Do |
| F3-24 | Ludwing (201907608) | Trigger alerta desde módulo antifraude (depende de F3-20) | 4.2 Notificaciones | To Do |
| F3-25 | Ludwing (201907608) | Variables SMTP + STT en .env separado por entorno | 4.4 CI/CD | To Do |
| F3-26 | Ludwing (201907608) | Integrar módulo de voz al flujo completo de evaluación | 4.1 Voz | To Do |

### 1.3 Acuerdos del Sprint Planning (martes 23/06)

- Rama base de trabajo: `develop`
- Cada tarea se trabaja en su propia rama: `feature/fase3-[modulo]-[carnet]`
- Commits diarios con formato `carnet: mensaje descriptivo`
- Meta del 23/06 (noche): Kevin entrega F3-14, F3-15 y F3-17 para desbloquear a Nufio y Ludwing
- Meta del 24/06 (noche): todos los módulos individuales completos y mergeados a develop
- Meta del 25/06 (noche): integración total, videos grabados y deploy a la nube funcionando
- Meta del 26/06: release a main, retrospectiva y entrega final

### 1.4 Cronograma del Sprint

| Fecha | Actividad |
|---|---|
| 23/06 (hoy) | Sprint Planning, captura del kanban inicial, crear ramas feature/ |
| 24/06 | Día 1 de desarrollo, primer daily |
| 25/06 | Día 2 de desarrollo, segundo daily, merge a develop, integración y pruebas finales |
| 26/06 | Release a main, retrospectiva, entrega |

### 1.5 Captura del Tablero Kanban — Inicio del Sprint

![Kanban inicial Fase 3](../docs/Images/inicio_kanban_f3.png)

---
### Martes 23/06/2026

#### Alejandra Mansilla — Scrum Master + Pruebas

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Ejecuté el Sprint Planning de la Fase 3: definí las 26 tareas del backlog, las distribuí en el tablero Kanban de Trello con etiquetas, descripciones y fechas de entrega, y creé la bitácora `Bitacora_Scrum_F3.md` con el formato oficial del sprint. Renombré la bitácora de Fase 2 a `Bitacora_Scrum_F2.md` y subí la imagen del kanban inicial a `docs/Images/inicio_kanban_f3.png`. Todo commiteado y pusheado a develop. Resultado: repositorio actualizado con la estructura de documentación de Fase 3 lista para iniciar el sprint.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Redactaré el borrador del capítulo de voz del DDA (F3-08), justificando el nuevo estilo arquitectónico introducido para manejar el flujo de audio y el asincronismo, trazable con la sección 4.1 del enunciado y con EaC01 (desempeño bajo picos de tráfico) y EaC03 (disponibilidad) del DDA.

3. **¿Existen impedimentos técnicos o de integración?**
   Las tareas de pruebas (F3-05, F3-06, F3-07) están bloqueadas hasta que Kevin entregue el endpoint STT (F3-14, F3-15) y el servicio SMTP (F3-17). Sin ese código no es posible escribir ni ejecutar las pruebas de los nuevos módulos.

---

#### Kevin Santos — STT Backend + Notificaciones

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Aplicó correcciones de la Fase 2 sobre el módulo de integración: realizó fixes en el flujo de ingesta de datos académicos y en el proceso de login federado, resolviendo inconsistencias que quedaron pendientes del sprint anterior. Resultado: módulo dev2-integracion estable y listo para recibir las nuevas funcionalidades de la Fase 3.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Implementará el servicio SMTP transversal con Nodemailer (F3-17) y la integración Speech-to-Text para el procesamiento de audio (F3-14, F3-15), trazables con la sección 4.2 de notificaciones y la sección 4.1 de voz del enunciado, y con EaC01 (desempeño) y EaC04 (seguridad en tránsito) del DDA.

3. **¿Existen impedimentos técnicos o de integración?**
   Sin impedimentos.

---

#### Ludwing Lopez — Docker + Infra + Triggers

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Realizó optimizaciones al sistema de base de datos de la Fase 2, corrigiendo problemas en la forma en que los módulos recibían y procesaban la información. Resultado: la capa de datos queda estable y consistente como base para las nuevas integraciones de la Fase 3.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Preparará el docker-compose para los entornos de Staging y Producción (F3-22), trazable con la sección 4.4 del enunciado y con RT01 y RT02 del DDA que exigen arquitectura preparada para despliegue multi-entorno.

3. **¿Existen impedimentos técnicos o de integración?**
   Sin impedimentos.

---

#### Nufio — Frontend + CI/CD

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**
   Inició la investigación sobre CI/CD y revisó la documentación de GitHub Actions y las opciones de despliegue en Railway y Render para definir la estrategia del pipeline. Resultado: definición clara del enfoque técnico para implementar el pipeline de la Fase 3.

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**
   Iniciará la implementación de sus tareas correspondientes: la UI de grabación de voz en el examen móvil (F3-09) y el esqueleto del pipeline CI/CD en GitHub Actions (F3-12), trazables con la sección 4.1 de voz y la sección 4.4 de CI/CD del enunciado.

3. **¿Existen impedimentos técnicos o de integración?**
   Se identificó que Alejandra necesita permisos de administrador en el repositorio para gestionar ciertas configuraciones del pipeline. Pendiente de resolución antes de que Nufio avance en la configuración del deploy.

---

### Miércoles 25/06/2026

#### Alejandra Mansilla — Scrum Master + Pruebas

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Nufio — Frontend + CI/CD

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Kevin Santos — STT Backend + Notificaciones

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Ludwing Lopez — Docker + Infra + Triggers

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

### Jueves 26/06/2026

#### Alejandra Mansilla — Scrum Master + Pruebas

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Nufio — Frontend + CI/CD

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Kevin Santos — STT Backend + Notificaciones

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

#### Ludwing Lopez — Docker + Infra + Triggers

1. **¿Qué materializaste/refactorizaste ayer y cuál fue el resultado?**

2. **¿Qué vas a codificar hoy y cómo asegura trazabilidad con drivers/EaC/restricciones?**

3. **¿Existen impedimentos técnicos o de integración?**

---

## 3. Sprint Retrospective e Impacto Estructural

### Alejandra Mansilla — Scrum Master + Pruebas

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código fuente real?**

- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas evidentes, provocaron cuellos de botella o requirieron una refactorización de emergencia durante la implementación?**

- **¿Qué mejoras técnicas concretas se proponen para asegurar la mantenibilidad futura del ecosistema?**

---

### Nufio — Frontend + CI/CD

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código fuente real?**

- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas evidentes, provocaron cuellos de botella o requirieron una refactorización de emergencia durante la implementación?**

- **¿Qué mejoras técnicas concretas se proponen para asegurar la mantenibilidad futura del ecosistema?**

---

### Kevin Santos — STT Backend + Notificaciones

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código fuente real?**

- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas evidentes, provocaron cuellos de botella o requirieron una refactorización de emergencia durante la implementación?**

- **¿Qué mejoras técnicas concretas se proponen para asegurar la mantenibilidad futura del ecosistema?**

---

### Ludwing Lopez — Docker + Infra + Triggers

- **¿Qué decisiones de diseño y patrones arquitectónicos se consolidaron con éxito al interactuar con el código fuente real?**

- **¿Qué supuestos teóricos o diagramas de la Fase 1 demostraron fallas evidentes, provocaron cuellos de botella o requirieron una refactorización de emergencia durante la implementación?**

- **¿Qué mejoras técnicas concretas se proponen para asegurar la mantenibilidad futura del ecosistema?**

---

## 4. Cierre del Sprint

### 4.1 Captura del Tablero Kanban — Cierre del Sprint

![Kanban final Fase 3](Docs/Images/cierre_kanban_f3.png)

### 4.2 Burndown Chart / Resumen de Tareas

| Día | Tareas completadas | Tareas pendientes | Notas |
|---|---|---|---|
| Martes 23/06 | | | Sprint Planning |
| Miércoles 24/06 | | | |
| Jueves 25/06 | | | |
| Viernes 26/06 | | | Cierre del sprint |

![Burndown Chart Fase 3](Docs/Images/burndown_chart_f3.png)

### 4.3 Grabaciones de Reuniones

> Enlace al repositorio de grabaciones de las reuniones del equipo durante el sprint.

[Grabaciones del Sprint — Google Drive]()

---

## 5. Aplicación de Feedback de la Fase 2

No se recibió feedback de la Fase 2 que requiera correcciones en esta fase. El equipo
continúa directamente con la evolución arquitectónica planificada para la Fase 3.