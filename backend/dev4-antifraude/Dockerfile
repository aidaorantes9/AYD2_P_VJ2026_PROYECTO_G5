FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY schema.sql ./schema.sql


EXPOSE 4004

CMD ["node", "src/server.js"]