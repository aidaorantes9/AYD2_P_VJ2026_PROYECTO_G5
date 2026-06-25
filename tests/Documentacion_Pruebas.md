# Documentacion de Pruebas — PRCCD Fase 3

## Pruebas Unitarias (F3-05)

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

### Integracion con el pipeline CI/CD

Estas pruebas se ejecutan automaticamente en la fase Test del pipeline
de GitHub Actions con el siguiente comando:

```bash
cd tests && npm test
```

---

## Pruebas de Integracion (F3-06)

### Prueba de Integracion 1 — [nombre]

Enlace al video: [por agregar](https://drive.google.com/drive/folders/1-SWEBBs9clUGlC0Eym9vq7eZlRAcfWYR?usp=sharing)

---

### Prueba de Integracion 2 — [nombre]

Enlace al video: [por agregar](https://drive.google.com/drive/folders/1-SWEBBs9clUGlC0Eym9vq7eZlRAcfWYR?usp=sharing)

---

### Prueba de Integracion 3 — [nombre]

Enlace al video: [por agregar](https://drive.google.com/drive/folders/1-SWEBBs9clUGlC0Eym9vq7eZlRAcfWYR?usp=sharing)

---

## Prueba de Aceptacion (F3-07)

Enlace al video: [por agregar](https://drive.google.com/drive/folders/1-SWEBBs9clUGlC0Eym9vq7eZlRAcfWYR?usp=sharing)