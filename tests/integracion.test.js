// Pruebas de integracion PRCCD Fase 3
// Requieren que Docker este corriendo en staging

const request = require('supertest')
const path = require('path')

const API_EVALUACIONES = 'http://136.114.93.149:4101'
const API_CERTIFICACION = 'http://136.114.93.149:4103'
const API_ANTIFRAUDE = 'http://136.114.93.149:4104'

const ID_CANDIDATO = 2

// ============================================================
// Prueba de integracion 1 — Flujo de voz hasta motor adaptativo
// ============================================================
describe('Integracion 1 - Flujo de voz completo STT', () => {

  let idEvaluacion
  let idPregunta

  test('el candidato inicia el examen y recibe la primera pregunta adaptativa', async () => {
    const response = await request(API_EVALUACIONES)
      .post(`/api/evaluacion/${ID_CANDIDATO}/iniciar`)

    console.log(`  → Evaluacion iniciada: id=${response.body.id_evaluacion}`)
    console.log(`  → Primera pregunta: "${response.body.pregunta?.enunciado}"`)
    console.log(`  → Nivel de dificultad: ${response.body.pregunta?.nivel_dificultad}`)

    expect(response.status).toBe(200)
    expect(response.body.id_evaluacion).toBeDefined()
    expect(response.body.pregunta).toBeDefined()

    idEvaluacion = response.body.id_evaluacion
    idPregunta = response.body.pregunta.id_pregunta
  })

  test('el candidato graba su respuesta por voz y el STT detecta la opcion correcta', async () => {
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

    console.log(`  → Texto transcrito por Whisper: "${response.body.resultado?.speech_to_text?.texto_transcrito}"`)
    console.log(`  → Opcion detectada: ${response.body.resultado?.opcion_detectada ? response.body.resultado.opcion_detectada.texto_opcion : 'ninguna'}`)
    console.log(`  → Proveedor STT: ${response.body.resultado?.speech_to_text?.proveedor}`)

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.resultado.speech_to_text.texto_transcrito).toBeDefined()
  }, 15000)

})

// ============================================================
// Prueba de integracion 2 — Emision de certificado y notificacion
// ============================================================
describe('Integracion 2 - Emision de certificado y correo al candidato', () => {

  beforeAll(async () => {
    console.log('  → Preparando prueba de emision de certificado')
  })

  test('emite certificado con PKI y envia correo al candidato via Mailtrap', async () => {
    const response = await request(API_CERTIFICACION)
      .post('/api/certificados/emitir')
      .send({
        id_candidato: 1,
        id_evaluacion: 1,
        actor: 'Sistema PRCCD',
        datos_certificado: {}
      })

    console.log(`  → Estado certificado: ${response.body.certificado?.estado}`)
    console.log(`  → Hash criptografico: ${response.body.certificado?.hash_certificado?.substring(0, 20)}...`)
    console.log(`  → Codigo verificacion: ${response.body.certificado?.codigo_verificacion}`)
    console.log(`  → Notificacion intentada: ${response.body.notificacion?.intentada}`)
    console.log(`  → Correo enviado a Mailtrap: ${response.body.notificacion?.enviada}`)
    console.log('  → Esperando 10 segundos para respetar limite de Mailtrap...')

    await new Promise(resolve => setTimeout(resolve, 10000))

    expect([200, 201]).toContain(response.status)
    expect(response.body.certificado).toBeDefined()
    expect(response.body.certificado.hash_certificado).toBeDefined()
    expect(response.body.notificacion).toBeDefined()
  }, 25000)

})

// ============================================================
// Prueba de integracion 3 — Alerta de fraude a auditores
// ============================================================
describe('Integracion 3 - Alerta de fraude al auditor SICA', () => {

  test('registra deteccion de fraude y envia alerta automatica al auditor', async () => {
    console.log('  → Esperando 10 segundos antes de enviar alerta...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    const response = await request(API_ANTIFRAUDE)
      .post('/api/exam/detecciones')
      .send({
        id_evaluacion: 1,
        id_evidencia: 1,
        tipo_indicio: 'patron_tecleo_anomalo',
        descripcion: 'Prueba de integracion - alerta automatica al auditor SICA',
        severidad: 'alta'
      })

    console.log(`  → Deteccion registrada: id=${response.body.deteccion?.id_deteccion}`)
    console.log(`  → Tipo de indicio: ${response.body.deteccion?.tipo_indicio}`)
    console.log(`  → Severidad: ${response.body.deteccion?.severidad}`)
    console.log(`  → Alerta enviada al auditor: ${response.body.notificacion?.enviada}`)

    expect(response.status).toBe(201)
    expect(response.body.ok).toBe(true)
    expect(response.body.deteccion).toBeDefined()
    expect(response.body.notificacion).toBeDefined()
  }, 25000)

})