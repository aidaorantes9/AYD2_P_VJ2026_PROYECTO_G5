# Guia

---

## 1. Levantar el proyecto completo

> En caso de que usen podman, solo cambien la palabra `docker` por `podman`.

### Arrancar Staging

```bash
docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  up -d --build --wait --wait-timeout 600
```

Accesos:

```text
Frontend: http://localhost:5174
APIs:     http://localhost:4101 hasta http://localhost:4106
MySQL:    localhost:3307
```
Para revisar los contenedores:

```bash
docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  ps
```

Todos deberían aparecer como `Up` y, cuando corresponda, `healthy`.

### Apagar Staging sin borrar la base de datos

```bash
docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  down
```

Producción se utiliza para comprobar que la configuración final también puede arrancar correctamente.

```bash
docker compose \
  --env-file environments/production/compose.env \
  -f docker-compose.yml \
  -f docker-compose.production.yml \
  up -d --build --wait --wait-timeout 600
```

Accesos:

```text
Frontend: http://localhost:5173
APIs:     http://localhost:4001 hasta http://localhost:4006
MySQL:    localhost:3306
```

Para apagarlo:

```bash
docker compose \
  --env-file environments/production/compose.env \
  -f docker-compose.yml \
  -f docker-compose.production.yml \
  down
```

No es necesario mantener Staging y Producción encendidos al mismo tiempo. Esto consume más memoria, procesador y espacio.

---

## 2. Levantar unicamente frontend
Este comando inicia solamente el contenedor del frontend de Staging:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  up -d --build --no-deps frontend

El frontend estará disponible en:

http://localhost:5174

Para revisar su estado:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  ps frontend

Para ver sus logs:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  logs -f frontend

Para detener únicamente el frontend:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  stop frontend

El frontend puede abrirse por sí solo, pero las funciones como iniciar sesión, realizar evaluaciones, emitir certificados o consultar información no funcionarán mientras los servicios backend y MySQL estén apagados.

Para levantar únicamente el frontend de Producción:

docker compose \
  --env-file environments/production/compose.env \
  -f docker-compose.yml \
  -f docker-compose.production.yml \
  up -d --build --no-deps frontend

En Producción se abre en:

http://localhost:5173


## 4. Conectarse MySQL
Para iniciar solamente la base de datos de Staging:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  up -d --wait --wait-timeout 120 mysql

Para comprobar su estado:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  ps mysql

MySQL de Staging estará disponible en:

Host: localhost
Puerto: 3307

Para detener únicamente MySQL:

docker compose \
  --env-file environments/staging/compose.env \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  stop mysql

Los datos no se eliminan al utilizar stop o down. Se eliminan únicamente al utilizar down -v.

Para iniciar solamente MySQL de Producción:

docker compose \
  --env-file environments/production/compose.env \
  -f docker-compose.yml \
  -f docker-compose.production.yml \
  up -d --wait --wait-timeout 120 mysql

MySQL de Producción estará disponible en:

Host: localhost
Puerto: 3306


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