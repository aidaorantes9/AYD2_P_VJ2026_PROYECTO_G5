# Acuerdos de Trabajo — Sprint Fase 2 (PRCCD)

**Objetivo de este documento:** establecer las reglas de trabajo para que los 6 integrantes trabajen de forma independiente durante el sprint y la integración del viernes sea ordenada y exitosa.

---

## 1. Stack tecnológico (obligatorio para todos)

| Capa | Tecnología | Notas |
|---|---|---|
| Base de datos | **MySQL 8** | Cada integrante levanta su propia instancia local (Docker o instalación directa) |
| Backend | **Node.js + Express** | Versión Node 18 o superior |
| Conexión a BD | `mysql2` (o Prisma con provider `mysql`) | |
| Frontend | **React** | Todos los módulos se implementan como componentes/páginas dentro de una sola app React |
| Librería de componentes UI | **CoreUI for React** | Todos los devs usan los mismos componentes CoreUI para mantener consistencia visual |
| Gráficas | **Recharts** | Compatible con CoreUI, usado por Nufio (201901444) en el dashboard |
| Hashes/cifrado | Módulo nativo `crypto` de Node | Para SHA-256 y AES — no se instalan librerías externas de cifrado |
| Parsers (Kevin (202101007)) | `papaparse` (CSV), `xml2js` (XML) | JSON se maneja con `JSON.parse` nativo |
| Testing de endpoints | Postman o Thunder Client (extensión VSCode) | |
| Control de versiones | Git + GitHub, mismo repo de Fase 1 | Formato de commit obligatorio: `carnet: mensaje` |

**Regla:** ningún integrante usa una tecnología distinta a las de esta tabla sin comunicarlo al equipo antes, ya que puede afectar la integración del viernes.

---

## 2. Librería de estilos — CoreUI for React

Se usa **CoreUI for React** como librería de componentes UI para todas las pantallas del portal. Esta decisión garantiza que todas las interfaces tengan el mismo estilo visual sin necesidad de coordinación adicional entre los devs.

### Por qué CoreUI

- Licencia MIT — Open Source, cumple RE02 del DDA.
- Componentes listos para dashboards, formularios, tablas y tarjetas.
- El diseño es consistente con los prototipos de UI/UX entregados en la Fase 1.
- Todos los devs usan los mismos componentes, el resultado visual es uniforme sin importar que trabajen por separado.

### Instalación (Nufio (201901444) la ejecuta hoy al crear el proyecto)

```bash
npx create-react-app portal-prccd
cd portal-prccd
npm install @coreui/react @coreui/icons-react @coreui/coreui
npm install recharts
```

### Componentes que usa cada Dev

**Kevin (202101007) — Login:**
```jsx
import { CContainer, CCard, CCardBody, CFormInput, CFormSelect, CButton, CBadge } from '@coreui/react'
```

**Lizz (201708997) — Examen:**
```jsx
import { CCard, CCardBody, CProgress, CBadge, CFormCheck, CButton } from '@coreui/react'
```

**Ludwing (201907608) — Certificado y Auditoría:**
```jsx
import { CCard, CCardBody, CAlert, CButton, CTable, CTableRow, CTableDataCell, CBadge } from '@coreui/react'
```

**Allan (202010046) — Antifraude:**
```jsx
import { CCard, CCardBody, CBadge, CAlert } from '@coreui/react'
```

**Nufio (201901444) — Dashboard:**
```jsx
import { CContainer, CRow, CCol, CCard, CCardBody, CFormSelect, CButton } from '@coreui/react'
import { BarChart, LineChart } from 'recharts'
```

**SM — Gestión de privacidad:**
```jsx
import { CCard, CCardBody, CBadge, CButton, CAlert } from '@coreui/react'
```

### Regla de estilos

Todos los devs importan componentes de `@coreui/react`. Nadie escribe CSS propio ni usa clases de Bootstrap o Tailwind. Si se necesita un ajuste visual puntual, se usa la prop `sx` o `style` del componente CoreUI.

---

## 3. Estructura de carpetas del repositorio

```
/AYD2_P_VJ2026_PROYECTO_G5
├── Docs/                        (ya existe, Fase 1)
├── backend/
│   ├── dev1-evaluaciones/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── .env.example
│   │   └── src/
│   ├── dev2-integracion/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── .env.example
│   │   ├── archivos_prueba/     (JSON, XML, CSV de universidades)
│   │   └── src/
│   ├── dev3-certificacion/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── .env.example
│   │   └── src/
│   ├── dev4-antifraude/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── .env.example
│   │   └── src/
│   ├── sm-seguridad/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── .env.example
│   │   └── src/
│   └── shared/
│       └── schema_completo.sql  (consolidado por SM el viernes)
├── frontend/
│   └── portal-prccd/            (proyecto React único con CoreUI)
└── Bitacora_Sprint_Fase2.md     (en la raíz del repo, obligatorio)
```

**Nufio (201901444) crea el proyecto React hoy mismo** y lo sube al repositorio aunque esté vacío, para que Lizz (201708997), Kevin (202101007) y Ludwing (201907608) puedan clonar y agregar sus pantallas como componentes separados desde el martes.

---

## 4. Convención de nombres

### 4.1 Tablas y columnas
Se usan exactamente los nombres del DER de la Fase 1 en snake_case y español: `Candidato`, `Evaluacion`, `id_candidato`, `id_evaluacion`, etc. Nadie traduce al inglés ni cambia mayúsculas o minúsculas.

### 4.2 Archivos SQL
- Cada integrante crea `schema.sql` en su carpeta con solo las tablas que le corresponden según el DER.
- Cada integrante crea `seed.sql` con sus datos ficticios usando los IDs acordados en la sección 5.
- El SM consolida todos los `schema.sql` en `backend/shared/schema_completo.sql` el viernes.

### 4.3 Ramas Git
Cada integrante trabaja en su propia rama con el formato: `feature/fase2-devX-carnet`
Ejemplo: `feature/fase2-dev1-201901444`

---

## 5. IDs y datos ficticios compartidos

Todos los integrantes usan estos mismos valores en sus seeds para garantizar que las tablas se conecten correctamente el viernes al integrarse en una sola base de datos.

### Acuerdo 1 — Candidato de prueba

`id_candidato = 1`, Ana López, USAC. Cada integrante que necesite referenciar un candidato en su tabla inserta este mismo registro en su `seed.sql`.

```sql
INSERT INTO Candidato (id_candidato, nombre_cifrado, email_cifrado, genero, id_externo_univ, fecha_registro, estado_gdpr)
VALUES (1, 'Ana Lopez', 'ana.lopez@usac.edu.gt', 'F', 'USAC-2024-001', '2026-06-15', 'activo');
```

Cada integrante trabaja con su propia base de datos local durante el sprint. Al integrar el viernes, todos usan el mismo `id_candidato = 1`, por lo que las tablas se conectan automáticamente por llaves foráneas.

---

### Acuerdo 2 — Evaluación aprobada de prueba

`id_evaluacion = 1`, candidato 1 (Ana López), `calificacion = 80.00`, `aprobada = true`. Ludwing (201907608) inserta este registro en su `seed.sql` para poder implementar la emisión del certificado sin esperar a que Lizz (201708997) termine el algoritmo.

```sql
INSERT INTO Evaluacion (id_evaluacion, id_candidato, id_competencia, id_periodo, calificacion, estado, aprobada)
VALUES (1, 1, 1, 1, 80.00, 'finalizada', true);
```

---

### Acuerdo 3 — Endpoint de resultado del examen (Lizz (201708997) → Nufio (201901444))

Lizz (201708997) expone el endpoint que Nufio (201901444) consume para mostrar el resultado del examen y habilitar la descarga del certificado.

**Endpoint:** `GET /api/evaluacion/{id_candidato}/resultado`

```json
{
  "id_evaluacion": 1,
  "id_candidato": 1,
  "calificacion": 80.00,
  "estado": "finalizada",
  "aprobada": true
}
```

Nufio (201901444) usa este JSON como mock mientras Lizz (201708997) termina su endpoint real. Al integrar, Nufio (201901444) solo cambia la URL del mock a la URL real.

---

### Acuerdo 4 — Endpoint de métricas (Allan (202010046) → Nufio (201901444))

Allan (202010046) expone el endpoint que Nufio (201901444) consume para graficar el dashboard analítico.

**Endpoint:** `GET /api/metricas?pais=GT&carrera=sistemas&genero=F`

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

Nufio (201901444) usa este JSON como mock mientras Allan (202010046) termina su endpoint real. Al integrar, Nufio (201901444) solo cambia la URL.

---

### Acuerdo 5 — Evidencia antifraude (Allan (202010046) → Ludwing (201907608))

Allan (202010046) inserta en su `seed.sql` los registros de `EvidenciaAntifraude`. Ludwing (201907608) inserta los mismos registros en su propio `seed.sql` para implementar la detección de fraude en CDU103 sin esperar a Allan (202010046). Al integrar el viernes, ambos leen de la misma tabla en la base de datos compartida.

```sql
INSERT INTO EvidenciaAntifraude (id_evidencia, id_evaluacion, tipo_evidencia, uri_almacenamiento, hash_sha256, algoritmo_cifrado, timestamp_captura, fecha_retencion_hasta, inmutable)
VALUES (1, 1, 'captura', '/evidencias/eval1_captura.png', 'a1b2c3d4...', 'AES-256', '2026-06-15 10:00:00', '2031-06-15', true);
```

---

### Acuerdo 6 — Número total de preguntas

El enunciado de Fase 2 presenta una inconsistencia: menciona "bloque acotado de 10 preguntas" pero también "completar las 5 preguntas". Se establece `TOTAL_PREGUNTAS = 10` implementado como constante configurable, de forma que si se requiere ajustar el número no implica reescribir la lógica del algoritmo.

```js
// config.js
const TOTAL_PREGUNTAS = 10;
```

Si la ingeniera o el auxiliar indican un número diferente, se actualiza esta constante y se comunica en el daily del día correspondiente.

---

### Tabla resumen de acuerdos

| Acuerdo | Valor acordado |
|---|---|
| `id_candidato` de prueba | `1` — Ana López, USAC-2024-001 |
| `id_evaluacion` de prueba | `1` — calificación 80.00, aprobada = true |
| Endpoint evaluación (Lizz (201708997) → Nufio (201901444)) | `GET /api/evaluacion/{id_candidato}/resultado` |
| Endpoint métricas (Allan (202010046) → Nufio (201901444)) | `GET /api/metricas` |
| Evidencia antifraude (Allan (202010046) → Ludwing (201907608)) | Tabla compartida `EvidenciaAntifraude`, `id_evidencia=1` |
| `TOTAL_PREGUNTAS` | `10` — constante configurable en `config.js` |

---

## 6. Contratos de API — resumen

| Contrato | Quién expone | Quién consume | Detalle |
|---|---|---|---|
| `GET /api/evaluacion/{id_candidato}/resultado` | Lizz (201708997) | Nufio (201901444) | Sección 5, Acuerdo 3 |
| `GET /api/metricas` | Allan (202010046) | Nufio (201901444) | Sección 5, Acuerdo 4 |
| Tabla `EvidenciaAntifraude` (tabla compartida, no endpoint) | Allan (202010046) | Ludwing (201907608) | Sección 5, Acuerdo 5 |

**Regla:** si durante el sprint se necesita cambiar un formato ya acordado, se comunica en el daily de esa noche para que el otro integrante ajuste su mock.

---

## 7. Puertos locales

| Servicio | Puerto |
|---|---|
| MySQL | `3306` |
| Lizz (201708997) — Motor de Evaluaciones | `4001` |
| Kevin (202101007) — Integración e Ingesta | `4002` |
| Ludwing (201907608) — Certificación y Auditoría | `4003` |
| Allan (202010046) — Antifraude y Métricas | `4004` |
| SM — Seguridad Transversal | `4005` |
| Nufio (201901444) — Frontend React | `5173` (Vite) o `3000` (CRA) |

Cada integrante configura su `.env` con su puerto asignado para que el viernes todos los servicios se levanten al mismo tiempo sin conflictos.

---

## 8. Variables de entorno

Cada carpeta `backend/devX-modulo/` incluye un archivo `.env.example` (sin contraseñas reales) con la estructura mínima. Cada integrante crea su `.env` local con sus valores:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=prccd
PORT=400X
```

El archivo `.env` no se sube a Git. Solo se sube `.env.example`.

---

## 9. Flujo de Git

- **Rama base:** `develop` (la misma de Fase 1).
- Cada integrante trabaja en su propia rama: `feature/fase2-devX-carnet`.
- Commits diarios con formato `carnet: mensaje descriptivo`. El enunciado exige commits sustanciales de código todos los días.
- Cada integrante hace merge a `develop` cuando su módulo funcione de forma aislada (jueves en la noche como límite).
- El viernes se hace la integración final en `develop` y luego release a `main`.

---

## 10. Checklist diario de cada integrante

Antes del daily de las 9:00 PM, cada uno verifica:

- [ ] ¿Mi `schema.sql` y `seed.sql` están actualizados con los IDs acordados?
- [ ] ¿Mi endpoint corre en mi puerto asignado y responde con el formato acordado?
- [ ] ¿Hice al menos un commit hoy con formato `carnet: mensaje`?
- [ ] ¿Actualicé mis tarjetas en Trello al estado real?
- [ ] ¿Llené mi parte del daily en `Bitacora_Sprint_Fase2.md`?

---

## 11. Checkpoint del jueves

El jueves cada integrante debe tener:

1. Backend corriendo en su puerto, conectado a su MySQL local.
2. Pantalla React consumiendo su propio endpoint (no mock).
3. Todo subido a su rama y mergeado a `develop`.

Si algún integrante no llega a este punto, lo comunica al SM antes del daily del jueves para tomar acciones antes del viernes.

---

## 12. Asignación de tablas del DER por integrante

Cada integrante crea el DDL de las tablas que le corresponden en su archivo `schema.sql`. Nadie toca las tablas de otro integrante. El SM consolida todos los `schema.sql` el viernes en `backend/shared/schema_completo.sql`.

### Lizz (201708997) — Motor de Evaluaciones

| Tabla | Descripción |
|---|---|
| `PeriodoCertificacion` | Registra los períodos de certificación (primera semana de cada mes) |
| `InscripcionPeriodo` | Tabla intermedia entre Candidato y PeriodoCertificacion. Incluye `UNIQUE(id_candidato, id_periodo)` |
| `Competencia` | Áreas de conocimiento que se evalúan |
| `Pregunta` | Banco de preguntas con `nivel_dificultad` (Básico/Intermedio/Avanzado) |
| `OpcionRespuesta` | Opciones de cada pregunta con `es_correcta` |
| `Evaluacion` | Registro de cada examen: candidato, competencia, período, calificación, aprobada |
| `RespuestaEvaluacion` | Cada respuesta individual: `dificultad_presentada`, `es_correcta`, `tiempo_respuesta_ms`, `orden_secuencia` |

---

### Kevin (202101007) — Integración e Ingesta

| Tabla | Descripción |
|---|---|
| `Pais` | Catálogo de países de la región con `codigo_iso` |
| `Universidad` | Instituciones con `protocolo_auth ENUM(LDAP,SAML,OAuth2)` y `formato_datos ENUM(JSON,XML,CSV)` |
| `Carrera` | Programas académicos vinculados a cada universidad |
| `Candidato` | Entidad central del negocio. `nombre_cifrado` y `email_cifrado` como `VARBINARY`. `estado_gdpr ENUM(activo,anonimizado,olvidado)` |
| `IngestaDatosAcademicos` | Registro de cada proceso de importación de datos desde una universidad |
| `HistorialAcademico` | Tabla nueva (feedback Fase 1): `id_historial`, `id_candidato`, `codigo_curso`, `nombre_curso`, `nota_final` |

---

### Ludwing (201907608) — Certificación y Auditoría

| Tabla | Descripción |
|---|---|
| `Certificado` | Credencial digital con `codigo_verificacion UNIQUE`, `hash_criptografico`, `firma_electronica`, `tipo_credencial ENUM(PKI,Blockchain)` |
| `BitacoraAuditoria` | Rastro inmutable encadenando `hash_anterior` y `hash_actual`. Estructura de cadena de hashes |
| `EntidadAuditora` | Dirección Financiera y Ministerios con `tipo ENUM(direccion_financiera,ministerio)` |
| `VerificacionAuditoria` | Resultado de cada auditoría: `resultado ENUM(integro,alterado)`, `rastro_validado`, `firmas_validadas` |

---

### Allan (202010046) — Antifraude y Métricas

| Tabla | Descripción |
|---|---|
| `EvidenciaAntifraude` | Telemetría capturada durante el examen: `tipo_evidencia ENUM(captura,log_tecleo,video)`, `hash_sha256`, `fecha_retencion_hasta` (+5 años), `inmutable BOOLEAN` |
| `DeteccionFraude` | Indicios de fraude detectados por CDU103 a partir de la evidencia de CDU100 |
| `MetricaAgregada` | Métricas anonimizadas segmentadas por país, carrera y género. `anonimizada BOOLEAN DEFAULT TRUE` |

---

### SM (Alejandra — 202100239) — Seguridad Transversal

| Tabla | Descripción |
|---|---|
| `CandidatoSeguridad` | Tabla propia del módulo de seguridad: `id`, `nombre_cifrado VARBINARY`, `email_cifrado VARBINARY`, `estado_gdpr ENUM(activo,anonimizado,olvidado)` |

---

### Nufio (201901444) — Dashboard y Portal

Nufio no crea tablas propias del DER. Su responsabilidad es crear el proyecto React con CoreUI, configurar el docker-compose con MySQL 8, y construir el portal que ensambla las pantallas de Lizz, Kevin y Ludwing, además del dashboard analítico que consume el endpoint de métricas de Allan.

---

### Tabla resumen de asignación

| Tabla | Integrante | Tarea |
|---|---|---|
| `PeriodoCertificacion` | Lizz (201708997) | T1 |
| `InscripcionPeriodo` | Lizz (201708997) | T1 |
| `Competencia` | Lizz (201708997) | T1 |
| `Pregunta` | Lizz (201708997) | T1 |
| `OpcionRespuesta` | Lizz (201708997) | T1 |
| `Evaluacion` | Lizz (201708997) | T1 |
| `RespuestaEvaluacion` | Lizz (201708997) | T1 |
| `Pais` | Kevin (202101007) | T5 |
| `Universidad` | Kevin (202101007) | T5 |
| `Carrera` | Kevin (202101007) | T5 |
| `Candidato` | Kevin (202101007) | T5 |
| `IngestaDatosAcademicos` | Kevin (202101007) | T5 |
| `HistorialAcademico` | Kevin (202101007) | T5 |
| `Certificado` | Ludwing (201907608) | T10 |
| `BitacoraAuditoria` | Ludwing (201907608) | T10 |
| `EntidadAuditora` | Ludwing (201907608) | T10 |
| `VerificacionAuditoria` | Ludwing (201907608) | T10 |
| `EvidenciaAntifraude` | Allan (202010046) | T15 |
| `DeteccionFraude` | Allan (202010046) | T15 |
| `MetricaAgregada` | Allan (202010046) | T15 |
| `CandidatoSeguridad` | Alejandra / SM (202100239) | T24 |
| — (sin tablas propias) | Nufio (201901444) | T22, T23 |

---

### Reglas importantes sobre las tablas

**Las llaves foráneas entre módulos** — cada integrante declara las FK hacia tablas de otros módulos en su propio `schema.sql`, pero apuntando a los IDs acordados en la sección 5. Ejemplo: Lizz (201708997) declara `id_candidato BIGINT` en `Evaluacion` como FK hacia `Candidato`, aunque `Candidato` la crea Kevin (202101007). El viernes, al consolidar los schemas, las FK se resuelven automáticamente porque todos usan los mismos nombres de tabla y columna.

**El orden de creación el viernes** es el siguiente para respetar las dependencias de FK:
1. Kevin (202101007) — `Pais`, `Universidad`, `Carrera`, `Candidato`, `IngestaDatosAcademicos`, `HistorialAcademico`
2. Lizz (201708997) — `PeriodoCertificacion`, `InscripcionPeriodo`, `Competencia`, `Pregunta`, `OpcionRespuesta`, `Evaluacion`, `RespuestaEvaluacion`
3. Allan (202010046) — `EvidenciaAntifraude`, `DeteccionFraude`, `MetricaAgregada`
4. Ludwing (201907608) — `Certificado`, `BitacoraAuditoria`, `EntidadAuditora`, `VerificacionAuditoria`
5. Alejandra / SM (202100239) — `CandidatoSeguridad`
6. Nufio (201901444) — no crea tablas, ejecuta docker-compose y consolida el portal React

Este orden garantiza que ninguna FK falle al crear el schema consolidado.

---

## Resumen ejecutivo de la reunión de hoy

Los acuerdos establecidos en este documento son obligatorios para todos los integrantes del equipo. El stack tecnológico es MySQL 8 + Node.js + Express + React + CoreUI + Recharts. Cada integrante trabaja en su propia carpeta y base de datos local durante el sprint, creando únicamente las tablas del DER que le corresponden según la sección 12. Todos usan `id_candidato = 1` (Ana López) e `id_evaluacion = 1` (aprobada, calificación 80.00) en sus seeds para garantizar que la integración del viernes sea exitosa. Los endpoints compartidos tienen un formato JSON acordado que permite trabajar con mocks desde hoy. El viernes, el SM consolida los schemas en el orden definido en la sección 12 para respetar las dependencias de llaves foráneas. Cualquier cambio a estos acuerdos durante el sprint se comunica en el daily de esa noche.