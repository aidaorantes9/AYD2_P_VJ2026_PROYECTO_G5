cat > backend/sm-seguridad/schema.sql << 'EOF'
CREATE DATABASE IF NOT EXISTS prccd;
USE prccd;

CREATE TABLE IF NOT EXISTS CandidatoSeguridad (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    nombre_cifrado VARBINARY(255) NOT NULL,
    email_cifrado  VARBINARY(255) NOT NULL,
    estado_gdpr    ENUM('activo', 'anonimizado', 'olvidado') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id)
);
EOF



-- Motor de Evaluaciones


CREATE TABLE IF NOT EXISTS PeriodoCertificacion (
  id_periodo        INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE NOT NULL,
  activo            BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS InscripcionPeriodo (
  id_inscripcion    INT AUTO_INCREMENT PRIMARY KEY,
  id_candidato      BIGINT NOT NULL,
  id_periodo        INT NOT NULL,
  fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_candidato, id_periodo),
  FOREIGN KEY (id_periodo) REFERENCES PeriodoCertificacion(id_periodo)
);

CREATE TABLE IF NOT EXISTS Competencia (
  id_competencia    INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  descripcion       TEXT
);

CREATE TABLE IF NOT EXISTS Pregunta (
  id_pregunta       INT AUTO_INCREMENT PRIMARY KEY,
  id_competencia    INT NOT NULL,
  enunciado         TEXT NOT NULL,
  nivel_dificultad  ENUM('Básico','Intermedio','Avanzado') NOT NULL,
  activa            BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_competencia) REFERENCES Competencia(id_competencia)
);

CREATE TABLE IF NOT EXISTS OpcionRespuesta (
  id_opcion         INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta       INT NOT NULL,
  texto_opcion      TEXT NOT NULL,
  es_correcta       BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta)
);

CREATE TABLE IF NOT EXISTS Evaluacion (
  id_evaluacion     INT AUTO_INCREMENT PRIMARY KEY,
  id_candidato      BIGINT NOT NULL,
  id_competencia    INT NOT NULL,
  id_periodo        INT NOT NULL,
  calificacion      DECIMAL(5,2) DEFAULT NULL,
  estado            ENUM('pendiente','en_progreso','finalizada') DEFAULT 'pendiente',
  aprobada          BOOLEAN DEFAULT FALSE,
  fecha_inicio      DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_fin         DATETIME DEFAULT NULL,
  FOREIGN KEY (id_competencia) REFERENCES Competencia(id_competencia),
  FOREIGN KEY (id_periodo)     REFERENCES PeriodoCertificacion(id_periodo)
);

CREATE TABLE IF NOT EXISTS RespuestaEvaluacion (
  id_respuesta          INT AUTO_INCREMENT PRIMARY KEY,
  id_evaluacion         INT NOT NULL,
  id_pregunta           INT NOT NULL,
  id_opcion_seleccionada INT,
  dificultad_presentada ENUM('Básico','Intermedio','Avanzado') NOT NULL,
  es_correcta           BOOLEAN DEFAULT FALSE,
  tiempo_respuesta_ms   INT DEFAULT NULL,
  orden_secuencia       INT NOT NULL,
  FOREIGN KEY (id_evaluacion) REFERENCES Evaluacion(id_evaluacion),
  FOREIGN KEY (id_pregunta)   REFERENCES Pregunta(id_pregunta)
);

