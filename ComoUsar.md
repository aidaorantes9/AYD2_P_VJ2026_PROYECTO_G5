# Guia

---

## 1. Levantar el proyecto completo

> En caso de que usen podman, solo cambien la palabra `docker` por `podman`.

### 1.1 Crear build inicial
> Este comando se ejecuta cada vez que se modifica el codigo fuente, si ustedes editan se actualizara solo, pero si algunos cambios si sera necesario que vuelvan a ejecutar el comando (tenganlo en cuenta para no perder tiempo resolviendo un problema que no existe).

```bash
docker compose up --build
```

### 1.2 Levantar el proyecto sin hacer build
```bash
docker compose up
```

### 1.3 Detener el proyecto

```bash
docker compose down
```

---

## 2. Levantar unicamente frontend

### 2.1 Ejecutar frontend
```bash
cd frontend/portal-prccd
npm start
```

## 3. En caso de errores (frontend)

> En caso de errores lo que haremos sera detener el compose y borrar los volumenes que podrian generar problema con librerias nuevas, con esto en teoria deberia de funcionar, si no es asi, el problema es ajeno a las librerias

``````bash
docker compose down -v
docker compose up --build
``````

## 4. Conectarse MySQL

```bash
docker exec -it prccd-mysql mysql -u root -p
```
> Contraseña: root

## 5. Generar llaves Pem para firmar certificados

> Si no se generan las llaves, no se podra firmar los certificados y no podra verificarlos

``````bash
mkdir -p backend/certificacion-auditoria/keys

node <<'NODE'
const fs = require('fs')
const {
  generarParClaves,
} = require('./backend/certificacion-auditoria/src/utils/firma')

const { publicKey, privateKey } = generarParClaves()

fs.writeFileSync(
  'backend/certificacion-auditoria/keys/private.pem',
  privateKey,
  { mode: 0o600 }
)

fs.writeFileSync(
  'backend/certificacion-auditoria/keys/public.pem',
  publicKey,
  { mode: 0o644 }
)

console.log('Llaves PKI generadas correctamente')
NODE

``````