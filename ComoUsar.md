# Guia

---

## 1. Levantar el proyecto completo

> En caso de que usen podman, solo cambien la palabra `docker` por `podman`.

### 1.1 Crear build inicial
> Este comando se ejecuta cada vez que se modifica el codigo fuente, para desarrollar recomiendo que mejor solo levanten el frontend, esto sera mas para la app final o por si quieren levantar junto con base de datos.

```bash
docker compose up --build
```

### 1.2 Detener el proyecto

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

