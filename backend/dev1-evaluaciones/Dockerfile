FROM node:22-bookworm-slim

WORKDIR /app

# Instala herramientas necesarias para Whisper local.
# curl permite descargar el modelo de Whisper.
# ffmpeg convierte audios mp3/webm/m4a/wav a WAV compatible.
# git, cmake, make y g++ permiten descargar y compilar whisper.cpp.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        cmake \
        make \
        g++ \
        ffmpeg \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Descarga whisper.cpp, descarga el modelo base y compila el binario whisper-cli.
RUN git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git /opt/whisper.cpp \
    && cd /opt/whisper.cpp \
    && sh ./models/download-ggml-model.sh base \
    && cmake -B build \
    && cmake --build build -j2 --config Release

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY schema.sql ./schema.sql

EXPOSE 4001

CMD ["node", "src/index.js"]