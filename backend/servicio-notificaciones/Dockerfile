FROM node:22-alpine

WORKDIR /app

# Copia primero los archivos de dependencias.
# Esto ayuda a que Docker reutilice caché si solo cambia el código fuente.
COPY package*.json ./

# Instala únicamente dependencias de producción.
RUN npm install --omit=dev

# Copia el código fuente del servicio.
COPY src ./src

# Expone el puerto usado por el servicio SMTP transversal.
EXPOSE 4006

# Inicia el servicio de notificaciones.
CMD ["node", "src/index.js"]