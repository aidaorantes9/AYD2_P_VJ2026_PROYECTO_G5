# Documentacion de Pruebas — PRCCD Fase 3

---

## Pruebas Unitarias

### Como ejecutar

```bash
cd tests
npm test
```

### Resultado
Test Suites: 1 passed, 1 total

Tests:       14 passed, 14 total

Time:        0.984 s

![Pruebas unitarias funcionando](../Docs/Images/unitarias_funcionando.png)

---

### Detalle de las pruebas

#### Prueba 1 — detectarOpcionDesdeTexto
Verifica que el nucleo del Speech-to-Text detecta correctamente la opcion
que dijo el candidato a partir del texto transcrito por Whisper.
Trazable con RF26 del DDA.

Casos de prueba:
- detecta respuesta uno correctamente
- detecta la respuesta dos correctamente
- retorna null si no detecta ninguna opcion

#### Prueba 2 — validarArchivoAudio
Verifica que el middleware de recepcion de audio acepta unicamente
formatos validos (mp3, wav, webm, m4a, ogg) y rechaza formatos invalidos.
Trazable con RF26 del DDA.

Casos de prueba:
- acepta un archivo mp3 valido
- acepta un archivo wav valido
- rechaza un archivo pdf invalido

#### Prueba 3 — obtenerAuditores
Verifica que la funcion parsea correctamente la lista de correos de
auditores desde la variable de entorno AUDITORES_ALERTA.
Trazable con RF29 del DDA.

Casos de prueba:
- parsea correctamente correos separados por coma
- parsea correctamente correos separados por punto y coma
- retorna arreglo vacio si no hay auditores configurados

#### Prueba 4 — quitarBarraFinal
Verifica que las URLs se limpian correctamente eliminando barras finales
para garantizar que las llamadas HTTP entre servicios se construyan bien.
Trazable con RF27 y RF29 del DDA.

Casos de prueba:
- elimina la barra final de una URL
- no modifica una URL sin barra final
- elimina multiples barras finales

#### Prueba 5 — notificarCertificadoEmitido
Verifica que el servicio de notificaciones es llamado correctamente
al emitir un certificado, usando mocks para simular HTTP y base de datos.
Trazable con RF27 del DDA.

Casos de prueba:
- retorna enviada true cuando el servicio responde ok
- lanza error cuando el servicio de notificaciones falla

---

### Integracion con el pipeline CI/CD

Estas pruebas se ejecutan automaticamente en la fase Test del pipeline
de GitHub Actions con el siguiente comando:

```bash
cd tests && npm test
```

---

## Pruebas de Integracion

Las pruebas de integracion verifican la comunicacion real entre los servicios
del sistema corriendo en Docker. Se ejecutan con Supertest desde la carpeta
tests con el comando:

```bash
cd tests
npx jest integracion.test.js --testTimeout=30000 --verbose
```

### Requisitos previos

- Docker corriendo en staging
- Llaves PKI generadas en `backend/certificacion-auditoria/keys/`
- Credenciales SMTP reales en `environments/staging/smtp.env`
- Variable `SMTP_ENV_FILE` apuntando a `smtp.env` en `environments/staging/compose.env`

### Nota

Las pruebas tienen delays de 10 segundos entre ejecuciones para respetar
el limite de velocidad del plan gratuito de Mailtrap. El tiempo total
de ejecucion es aproximadamente 40 segundos.

### Resultado

![Pruebas de integracion funcionando](../Docs/Images/pruebas_integracion.png)

---

### Prueba de Integracion 1 — Flujo de voz completo con STT

Verifica que el candidato puede iniciar el examen, grabar una respuesta
por voz y que el sistema la transcribe con Whisper local y detecta
la opcion seleccionada, integrando el frontend, el motor de evaluaciones
y el servicio STT en un flujo completo.

### Prueba de Integracion 2 — Emision de certificado y notificacion al candidato

Verifica que al emitir un certificado el sistema genera correctamente
el hash SHA-256 y la firma electronica RSA-2048, y que el servicio de
notificaciones envia el correo al candidato mediante Mailtrap.

### Prueba de Integracion 3 — Alerta de fraude al auditor

Verifica que cuando el modulo antifraude registra una deteccion de fraude,
el servicio de notificaciones envia automaticamente una alerta por correo
al auditor del SICA mediante Mailtrap.

---

## Prueba de Aceptacion

Verifica el flujo completo del sistema desde la perspectiva del candidato:
login, examen adaptativo respondiendo por voz, aprobacion, emision de
certificado y recepcion del correo de notificacion.

---

## Videos de Evidencia

Los videos de las pruebas de integracion y la prueba de aceptacion
se encuentran en la siguiente carpeta de Google Drive:

[Ver videos de evidencia](https://drive.google.com/drive/folders/1-SWEBBs9clUGlC0Eym9vq7eZlRAcfWYR?usp=sharing)