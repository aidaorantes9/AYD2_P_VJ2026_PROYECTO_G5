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

