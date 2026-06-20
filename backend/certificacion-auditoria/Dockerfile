FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY schema.sql ./schema.sql

EXPOSE 4003

CMD ["npm", "start"]
