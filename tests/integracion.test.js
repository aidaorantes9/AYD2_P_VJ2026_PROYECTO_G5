// Pruebas de integracion PRCCD Fase 3
// Requieren que Docker este corriendo en staging

const request = require('supertest')
const path = require('path')

// base url de los servicios en staging
const API_EVALUACIONES = 'http://localhost:4101'
const API_CERTIFICACION = 'http://localhost:4103'
const API_ANTIFRAUDE = 'http://localhost:4104'

// datos del candidato 2 que no tiene evaluacion previa
const ID_CANDIDATO = 2

// ============================================================
// Prueba de integracion 1 — Flujo de voz hasta motor adaptativo
// ============================================================
describe('Integracion 1 - Flujo de voz completo', () => {

  let idEvaluacion
  let idPregunta

  // primero iniciamos el examen para obtener la evaluacion y pregunta activa
  test('inicia el examen y obtiene primera pregunta', async () => {
    const response = await request(API_EVALUACIONES)
      .post(`/api/evaluacion/${ID_CANDIDATO}/iniciar`)

    expect(response.status).toBe(200)
    expect(response.body.id_evaluacion).toBeDefined()
    expect(response.body.pregunta).toBeDefined()

    idEvaluacion = response.body.id_evaluacion
    idPregunta = response.body.pregunta.id_pregunta
  })

  // luego enviamos un audio de prueba al endpoint de respuesta por voz
  test('envia audio y recibe opcion detectada por STT', async () => {
    const rutaAudio = path.join(
      __dirname,
      '../backend/dev1-evaluaciones/audiosPruebas/prueba1.mp3'
    )

    const response = await request(API_EVALUACIONES)
      .post('/api/evaluacion/respuesta-audio')
      .attach('audio', rutaAudio)
      .field('id_candidato', String(ID_CANDIDATO))
      .field('id_evaluacion', String(idEvaluacion))
      .field('id_pregunta', String(idPregunta))
      .field('texto_mock', 'respuesta uno')

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.resultado.speech_to_text.texto_transcrito).toBeDefined()
  }, 15000)

})

// ============================================================
// Prueba de integracion 2 — Emision de certificado y notificacion
// ============================================================
describe('Integracion 2 - Emision de certificado y correo al candidato', () => {

  test('emite certificado y dispara notificacion al candidato', async () => {
    const response = await request(API_CERTIFICACION)
      .post('/api/certificados/emitir')
      .send({
        id_candidato: 3,
        id_evaluacion: 6,
        actor: 'Sistema PRCCD',
        datos_certificado: {}
      })

    expect([200, 201]).toContain(response.status)
    expect(response.body.certificado).toBeDefined()
    expect(response.body.certificado.hash_certificado).toBeDefined()
    expect(response.body.notificacion).toBeDefined()
  }, 15000)

})

// ============================================================
// Prueba de integracion 3 — Alerta de fraude a auditores
// ============================================================
describe('Integracion 3 - Alerta de fraude al auditor', () => {

  test('registra deteccion de fraude y dispara alerta al auditor', async () => {
    const response = await request(API_ANTIFRAUDE)
      .post('/api/exam/detecciones')
      .send({
        id_evaluacion: 1,
        id_evidencia: 1,
        tipo_indicio: 'patron_tecleo_anomalo',
        descripcion: 'Prueba de integracion - alerta automatica al auditor',
        severidad: 'alta'
      })

    expect(response.status).toBe(201)
    expect(response.body.ok).toBe(true)
    expect(response.body.deteccion).toBeDefined()
    expect(response.body.notificacion).toBeDefined()
  }, 15000)

})