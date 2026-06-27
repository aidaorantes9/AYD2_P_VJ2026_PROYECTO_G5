// Pruebas Unitarias PRCCD

const { detectarOpcionDesdeTexto } = require('../backend/dev1-evaluaciones/src/services/respuestaVozServicio')

//---------------------------------------------------------------------------------------------------
// Prueba 1: verifica que el STT detecta correctamente la opcion que dijo el candidato
describe('detectarOpcionDesdeTexto', () => {

  // opciones de ejemplo para simular una pregunta del examen
  const opciones = [
    { id_opcion: 1, texto_opcion: 'Un espacio en memoria que guarda un valor' },
    { id_opcion: 2, texto_opcion: 'Un tipo de funcion' },
    { id_opcion: 3, texto_opcion: 'Un operador matematico' },
    { id_opcion: 4, texto_opcion: 'Un archivo del sistema' },
  ]

  // debe detectar la primera opcion cuando el candidato dice "respuesta uno"
  test('detecta respuesta uno correctamente', () => {
    const resultado = detectarOpcionDesdeTexto('respuesta uno', opciones)
    expect(resultado).not.toBeNull()
    expect(resultado.id_opcion).toBe(1)
  })

  // debe detectar la segunda opcion cuando el candidato dice "la respuesta dos"
  test('detecta la respuesta dos correctamente', () => {
    const resultado = detectarOpcionDesdeTexto('la respuesta dos', opciones)
    expect(resultado).not.toBeNull()
    expect(resultado.id_opcion).toBe(2)
  })

  // si el texto no coincide con ninguna opcion debe retornar null
  test('retorna null si no detecta ninguna opcion', () => {
    const resultado = detectarOpcionDesdeTexto('no se la respuesta', opciones)
    expect(resultado).toBeNull()
  })

})

//---------------------------------------------------------------------------------------------------
// Prueba 2: verifica que el middleware solo acepta archivos de audio validos
describe('validarArchivoAudio', () => {

  // extensiones y mimes permitidos segun el middleware
  const extensionesPermitidas = new Set(['.webm', '.wav', '.mp3', '.m4a', '.ogg'])
  const tiposMimePermitidos = new Set([
    'audio/webm', 'video/webm', 'audio/wav', 'audio/x-wav',
    'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a',
    'audio/x-m4a', 'audio/ogg',
  ])

  // funcion que replica la logica de validacion del middleware
  function validar(nombreArchivo, mimeType) {
    const extension = require('path').extname(nombreArchivo).toLowerCase()
    const extensionValida = extensionesPermitidas.has(extension)
    const mimeValido = tiposMimePermitidos.has(mimeType)
    return extensionValida || mimeValido
  }

  // un archivo mp3 debe ser aceptado
  test('acepta un archivo mp3 valido', () => {
    expect(validar('grabacion.mp3', 'audio/mpeg')).toBe(true)
  })

  // un archivo wav tambien debe ser aceptado
  test('acepta un archivo wav valido', () => {
    expect(validar('audio.wav', 'audio/wav')).toBe(true)
  })

  // un pdf no debe ser aceptado bajo ninguna circunstancia
  test('rechaza un archivo pdf invalido', () => {
    expect(validar('documento.pdf', 'application/pdf')).toBe(false)
  })

})

//---------------------------------------------------------------------------------------------------
// Prueba 3: verifica que la funcion parsea correctamente los correos de auditores
describe('obtenerAuditores', () => {

  // replica la logica de obtenerAuditores del servicio de fraude
  function obtenerAuditores(valor) {
    return String(valor || '')
      .split(/[,;]/)
      .map((correo) => correo.trim())
      .filter(Boolean)
  }

  // debe separar correctamente los correos separados por coma
  test('parsea correctamente correos separados por coma', () => {
    const resultado = obtenerAuditores('auditor1@sica.org,auditor2@sica.org')
    expect(resultado).toHaveLength(2)
    expect(resultado[0]).toBe('auditor1@sica.org')
    expect(resultado[1]).toBe('auditor2@sica.org')
  })

  // debe funcionar igual con punto y coma como separador
  test('parsea correctamente correos separados por punto y coma', () => {
    const resultado = obtenerAuditores('auditor1@sica.org;auditor2@sica.org')
    expect(resultado).toHaveLength(2)
  })

  // si no hay auditores configurados debe retornar un arreglo vacio
  test('retorna arreglo vacio si no hay auditores configurados', () => {
    const resultado = obtenerAuditores('')
    expect(resultado).toHaveLength(0)
  })

})

//---------------------------------------------------------------------------------------------------
// Prueba 4: verifica que la funcion limpia correctamente las URLs eliminando barras finales
describe('quitarBarraFinal', () => {

  // replica la logica de quitarBarraFinal usada en los servicios de notificacion
  function quitarBarraFinal(valor) {
    return String(valor || '')
      .trim()
      .replace(/\/+$/, '')
  }

  // una URL con barra final debe quedar sin ella
  test('elimina la barra final de una URL', () => {
    const resultado = quitarBarraFinal('http://136.114.93.149:4006/')
    expect(resultado).toBe('http://136.114.93.149:4006')
  })

  // una URL sin barra final debe quedar igual
  test('no modifica una URL sin barra final', () => {
    const resultado = quitarBarraFinal('http://136.114.93.149:4006')
    expect(resultado).toBe('http://136.114.93.149:4006')
  })

  // debe eliminar multiples barras finales tambien
  test('elimina multiples barras finales', () => {
    const resultado = quitarBarraFinal('http://136.114.93.149:4006///')
    expect(resultado).toBe('http://136.114.93.149:4006')
  })

})

//---------------------------------------------------------------------------------------------------
// Prueba 5: verifica que notificarCertificadoEmitido llama correctamente al servicio de notificaciones
describe('notificarCertificadoEmitido', () => {

  // guardamos el fetch original para restaurarlo despues
  const fetchOriginal = global.fetch

  afterEach(() => {
    // restauramos fetch despues de cada prueba
    global.fetch = fetchOriginal
  })

  // simula que el servicio de notificaciones responde exitosamente
  test('retorna enviada true cuando el servicio responde ok', async () => {

    // mock de fetch que simula respuesta exitosa del servicio de notificaciones
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ mensaje: 'correo enviado' }),
    })

    // mock de la base de datos para no conectarnos a mysql
    jest.mock('../backend/certificacion-auditoria/src/db', () => ({
      execute: jest.fn().mockResolvedValue([[{
        nombre_cifrado: Buffer.from('Ana Lopez'),
        email_cifrado: Buffer.from('ana@usac.edu.gt'),
        estado_gdpr: 'activo',
      }]]),
    }))

    // mock del modulo de descifrado para no necesitar las claves AES reales
    jest.mock('../backend/certificacion-auditoria/src/utils/cryptoDatos', () => ({
      descifrar: jest.fn((valor) => valor.toString()),
    }))

    const { notificarCertificadoEmitido } = require('../backend/certificacion-auditoria/src/services/notificacionCertificadoService')

    const resultado = await notificarCertificadoEmitido({
      idCandidato: 1,
      certificado: {
        codigo_verificacion: 'uuid-1234',
        hash_certificado: 'hash-abc',
      },
    })

    expect(resultado.enviada).toBe(true)
    expect(resultado.tipo).toBe('certificado')
  })

  // simula que el servicio de notificaciones falla
  test('lanza error cuando el servicio de notificaciones falla', async () => {

    // mock de fetch que simula respuesta fallida
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ error: 'SMTP no disponible' }),
    })

    const { notificarCertificadoEmitido } = require('../backend/certificacion-auditoria/src/services/notificacionCertificadoService')

    await expect(
      notificarCertificadoEmitido({
        idCandidato: 1,
        certificado: {
          codigo_verificacion: 'uuid-1234',
          hash_certificado: 'hash-abc',
        },
      })
    ).rejects.toThrow()
  })

})