ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim

ARG WHISPER_MODEL=base
ARG WHISPER_CPP_REF=master

ENV NODE_ENV=production \
    PORT=4001 \
    STT_PROVIDER=whisper_local \
    STT_MODEL=${WHISPER_MODEL} \
    MAX_AUDIO_MB=15 \
    WHISPER_CPP_BIN=/opt/whisper.cpp/build/bin/whisper-cli \
    WHISPER_CPP_MODEL=/opt/whisper.cpp/models/ggml-${WHISPER_MODEL}.bin \
    WHISPER_CPP_THREADS=4

WORKDIR /app

# Dependencias necesarias para compilar Whisper y procesar audio.
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

# Descarga, compila y valida Whisper local.
RUN git clone \
        --depth 1 \
        --branch "${WHISPER_CPP_REF}" \
        https://github.com/ggml-org/whisper.cpp.git \
        /opt/whisper.cpp \
    && cd /opt/whisper.cpp \
    && sh ./models/download-ggml-model.sh "${WHISPER_MODEL}" \
    && cmake -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --config Release -j2 \
    && test -x /opt/whisper.cpp/build/bin/whisper-cli \
    && test -f "/opt/whisper.cpp/models/ggml-${WHISPER_MODEL}.bin" \
    && rm -rf /opt/whisper.cpp/.git

# Instala solamente las dependencias de producción de Node.js.
COPY package.json package-lock.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

# Copia únicamente los archivos necesarios del servicio.
COPY src ./src
COPY schema.sql ./schema.sql

# Carpeta temporal utilizada para los audios recibidos.
RUN mkdir -p /app/tmp/audio

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:4001/api/salud').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "src/index.js"]
