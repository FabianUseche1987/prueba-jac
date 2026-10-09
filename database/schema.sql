-- =============================================================
-- JAC Connect · Estructura de la base de datos
-- Compatible con MariaDB 10.5+ y MySQL 8.0.16+
-- =============================================================
-- ¡ATENCIÓN! Este script BORRA todas las tablas y las crea de
-- nuevo, VACÍAS. Úsalo solo para crear la base de datos desde cero
-- (por ejemplo, una base de pruebas en tu computador).
--
-- NUNCA lo ejecutes contra la base de datos de Hostinger: para
-- actualizarla sin perder datos usa los archivos de migraciones/.
--
-- Orden: 1) schema.sql   2) seed.sql (datos de prueba)
-- =============================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
  calificacion, comentario, documento, notificacion_usuario, notificacion,
  avance_proyecto, proyecto, asistencia, reunion, predio,
  usuario_rol, rol, usuario, junta;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- Juntas de Acción Comunal
-- -------------------------------------------------------------
CREATE TABLE junta (
  id_junta            INT          NOT NULL AUTO_INCREMENT,
  nombre              VARCHAR(150) NOT NULL,
  barrio              VARCHAR(100) NOT NULL,
  municipio           VARCHAR(100) NOT NULL,
  departamento        VARCHAR(100) DEFAULT NULL,
  nit                 VARCHAR(20)  DEFAULT NULL,
  representante_legal VARCHAR(150) DEFAULT NULL,
  fecha_fundacion     DATE         DEFAULT NULL,
  estado              VARCHAR(20)  NOT NULL DEFAULT 'activa',
  PRIMARY KEY (id_junta),
  CONSTRAINT chk_junta_estado CHECK (estado IN ('activa', 'inactiva'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Usuarios
-- -------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario       INT          NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  -- El registro los pide siempre (lo valida el backend). Quedan NULL
  -- solo para usuarios creados antes de existir estas columnas.
  tipo_documento   VARCHAR(5)   DEFAULT NULL,  -- CC, TI o CE
  numero_documento VARCHAR(20)  DEFAULT NULL,
  email            VARCHAR(150) NOT NULL,      -- con el correo se inicia sesión
  telefono         VARCHAR(20)  DEFAULT NULL,
  contrasena_hash  VARCHAR(255) NOT NULL,      -- siempre cifrada con bcrypt
  estado           VARCHAR(20)  NOT NULL DEFAULT 'activo',
  fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso    TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_email (email),
  UNIQUE KEY uq_usuario_documento (numero_documento),
  CONSTRAINT chk_usuario_estado   CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT chk_usuario_tipo_doc CHECK (tipo_documento IN ('CC', 'TI', 'CE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Roles (cargos)
-- es_directivo = 1 -> puede crear y editar información de su junta
-- -------------------------------------------------------------
CREATE TABLE rol (
  id_rol       INT         NOT NULL AUTO_INCREMENT,
  nombre_rol   VARCHAR(80) NOT NULL,
  descripcion  TEXT        DEFAULT NULL,
  es_directivo TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_rol_nombre (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Rol de cada usuario en su junta
-- Un usuario pertenece a UNA sola junta y tiene UN solo rol.
-- id_junta es NULL solo para el rol Administrador (no pertenece a
-- ninguna junta); el backend valida esa regla.
-- -------------------------------------------------------------
CREATE TABLE usuario_rol (
  id_usuario_rol INT         NOT NULL AUTO_INCREMENT,
  id_usuario     INT         NOT NULL,
  id_rol         INT         NOT NULL,
  id_junta       INT         DEFAULT NULL,
  fecha_inicio   DATE        DEFAULT NULL,
  fecha_fin      DATE        DEFAULT NULL,
  estado         VARCHAR(20) NOT NULL DEFAULT 'activo',
  PRIMARY KEY (id_usuario_rol),
  UNIQUE KEY uq_ur_usuario (id_usuario),
  KEY fk_ur_rol (id_rol),
  KEY idx_ur_junta (id_junta),
  CONSTRAINT chk_ur_estado CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_ur_rol     FOREIGN KEY (id_rol)     REFERENCES rol (id_rol),
  CONSTRAINT fk_ur_junta   FOREIGN KEY (id_junta)   REFERENCES junta (id_junta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Bienes comunales (salón, cancha, parque...)
-- -------------------------------------------------------------
CREATE TABLE predio (
  id_predio              INT           NOT NULL AUTO_INCREMENT,
  id_junta               INT           NOT NULL,
  nombre                 VARCHAR(150)  NOT NULL,
  descripcion            TEXT          DEFAULT NULL,
  tipo_uso               VARCHAR(80)   DEFAULT NULL,
  area_m2                DECIMAL(10,2) DEFAULT NULL,
  direccion              VARCHAR(200)  DEFAULT NULL,
  estado_juridico        VARCHAR(50)   DEFAULT NULL,
  estado_fisico          VARCHAR(50)   DEFAULT NULL,
  valor_catastral        DECIMAL(15,2) DEFAULT NULL,
  matricula_inmobiliaria VARCHAR(50)   DEFAULT NULL,
  PRIMARY KEY (id_predio),
  KEY idx_pd_junta (id_junta),
  CONSTRAINT fk_pd_junta FOREIGN KEY (id_junta) REFERENCES junta (id_junta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Reuniones y asambleas
-- tipo: ordinaria | extraordinaria | directiva
-- modalidad: presencial | virtual | mixta
-- estado: programada | realizada | cancelada
-- -------------------------------------------------------------
CREATE TABLE reunion (
  id_reunion       INT          NOT NULL AUTO_INCREMENT,
  id_junta         INT          NOT NULL,
  id_creador       INT          NOT NULL,
  tipo             VARCHAR(30)  DEFAULT NULL,
  titulo           VARCHAR(200) NOT NULL,
  orden_del_dia    TEXT         DEFAULT NULL,
  fecha_hora       DATETIME     NOT NULL,
  lugar            VARCHAR(200) DEFAULT NULL,
  modalidad        VARCHAR(20)  DEFAULT NULL,
  estado           VARCHAR(20)  NOT NULL DEFAULT 'programada',
  acta_resumen     TEXT         DEFAULT NULL,
  quorum_requerido INT          DEFAULT NULL,
  PRIMARY KEY (id_reunion),
  KEY fk_re_creador (id_creador),
  KEY idx_re_junta (id_junta),
  KEY idx_re_fecha_hora (fecha_hora),
  CONSTRAINT fk_re_creador FOREIGN KEY (id_creador) REFERENCES usuario (id_usuario),
  CONSTRAINT fk_re_junta   FOREIGN KEY (id_junta)   REFERENCES junta (id_junta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Asistencia a cada reunión
-- -------------------------------------------------------------
CREATE TABLE asistencia (
  id_asistencia INT        NOT NULL AUTO_INCREMENT,
  id_reunion    INT        NOT NULL,
  id_usuario    INT        NOT NULL,
  asistio       TINYINT(1) NOT NULL DEFAULT 0,
  hora_llegada  TIME       DEFAULT NULL,
  justificacion TEXT       DEFAULT NULL,
  PRIMARY KEY (id_asistencia),
  UNIQUE KEY uq_asistencia (id_reunion, id_usuario),
  KEY fk_as_usuario (id_usuario),
  KEY idx_as_reunion (id_reunion),
  CONSTRAINT fk_as_reunion FOREIGN KEY (id_reunion) REFERENCES reunion (id_reunion) ON DELETE CASCADE,
  CONSTRAINT fk_as_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Proyectos
-- estado: planeado | en_ejecucion | finalizado | cancelado
-- prioridad: 1 (más alta) a 5
-- -------------------------------------------------------------
CREATE TABLE proyecto (
  id_proyecto           INT           NOT NULL AUTO_INCREMENT,
  id_junta              INT           NOT NULL,
  id_responsable        INT           NOT NULL,
  codigo                VARCHAR(30)   DEFAULT NULL,
  nombre                VARCHAR(200)  NOT NULL,
  descripcion           TEXT          DEFAULT NULL,
  categoria             VARCHAR(80)   DEFAULT NULL,
  estado                VARCHAR(30)   NOT NULL DEFAULT 'planeado',
  presupuesto_total     DECIMAL(15,2) DEFAULT NULL,
  presupuesto_ejecutado DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  fecha_inicio_plan     DATE          DEFAULT NULL,
  fecha_fin_plan        DATE          DEFAULT NULL,
  fecha_inicio_real     DATE          DEFAULT NULL,
  fecha_fin_real        DATE          DEFAULT NULL,
  prioridad             INT           NOT NULL DEFAULT 3,
  PRIMARY KEY (id_proyecto),
  KEY fk_pr_responsable (id_responsable),
  KEY idx_pr_junta (id_junta),
  KEY idx_pr_estado (estado),
  CONSTRAINT fk_pr_junta       FOREIGN KEY (id_junta)       REFERENCES junta (id_junta) ON DELETE CASCADE,
  CONSTRAINT fk_pr_responsable FOREIGN KEY (id_responsable) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Avances de cada proyecto
-- -------------------------------------------------------------
CREATE TABLE avance_proyecto (
  id_avance             INT           NOT NULL AUTO_INCREMENT,
  id_proyecto           INT           NOT NULL,
  id_reporta            INT           NOT NULL,
  descripcion           TEXT          NOT NULL,
  porcentaje_completado INT           NOT NULL DEFAULT 0,
  monto_ejecutado       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  fecha_reporte         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo_avance           VARCHAR(30)   DEFAULT NULL,  -- compra | obra | informe ...
  PRIMARY KEY (id_avance),
  KEY fk_av_reporta (id_reporta),
  KEY idx_av_proyecto (id_proyecto),
  CONSTRAINT chk_av_porcentaje CHECK (porcentaje_completado BETWEEN 0 AND 100),
  CONSTRAINT chk_av_monto      CHECK (monto_ejecutado >= 0),
  CONSTRAINT fk_av_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyecto (id_proyecto) ON DELETE CASCADE,
  CONSTRAINT fk_av_reporta  FOREIGN KEY (id_reporta)  REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Avisos (notificaciones) de la junta
-- tipo: reunion | proyecto | general
-- prioridad: alta | media | baja
-- audiencia: todos | directivos
-- -------------------------------------------------------------
CREATE TABLE notificacion (
  id_notificacion  INT          NOT NULL AUTO_INCREMENT,
  id_junta         INT          NOT NULL,
  id_remitente     INT          NOT NULL,
  titulo           VARCHAR(200) NOT NULL,
  mensaje          TEXT         NOT NULL,
  tipo             VARCHAR(30)  DEFAULT NULL,
  prioridad        VARCHAR(10)  NOT NULL DEFAULT 'media',
  audiencia        VARCHAR(20)  NOT NULL DEFAULT 'todos',
  fecha_envio      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id_notificacion),
  KEY fk_no_remitente (id_remitente),
  KEY idx_no_junta (id_junta),
  KEY idx_no_fecha_envio (fecha_envio),
  CONSTRAINT fk_no_junta      FOREIGN KEY (id_junta)     REFERENCES junta (id_junta) ON DELETE CASCADE,
  CONSTRAINT fk_no_remitente  FOREIGN KEY (id_remitente) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Qué avisos leyó cada usuario
-- -------------------------------------------------------------
CREATE TABLE notificacion_usuario (
  id_notif_usuario INT        NOT NULL AUTO_INCREMENT,
  id_notificacion  INT        NOT NULL,
  id_usuario       INT        NOT NULL,
  leida            TINYINT(1) NOT NULL DEFAULT 0,
  fecha_lectura    TIMESTAMP  NULL DEFAULT NULL,
  PRIMARY KEY (id_notif_usuario),
  UNIQUE KEY uq_notif_usuario (id_notificacion, id_usuario),
  KEY idx_nu_usuario (id_usuario),
  CONSTRAINT fk_nu_notificacion FOREIGN KEY (id_notificacion) REFERENCES notificacion (id_notificacion) ON DELETE CASCADE,
  CONSTRAINT fk_nu_usuario      FOREIGN KEY (id_usuario)      REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Documentos (actas, cotizaciones, fotos, escrituras...)
-- Pertenecen a un proyecto, una reunión o un predio.
-- -------------------------------------------------------------
CREATE TABLE documento (
  id_documento   INT          NOT NULL AUTO_INCREMENT,
  id_proyecto    INT          DEFAULT NULL,
  id_reunion     INT          DEFAULT NULL,
  id_predio      INT          DEFAULT NULL,
  id_subido_por  INT          NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(50)  DEFAULT NULL,  -- acta | cotizacion | fotografia | informe | escritura
  ruta_archivo   VARCHAR(500) DEFAULT NULL,
  tamano_bytes   BIGINT       DEFAULT NULL,
  fecha_subida   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_documento),
  KEY fk_do_predio (id_predio),
  KEY fk_do_subido_por (id_subido_por),
  KEY idx_do_proyecto (id_proyecto),
  KEY idx_do_reunion (id_reunion),
  CONSTRAINT fk_do_predio      FOREIGN KEY (id_predio)     REFERENCES predio (id_predio) ON DELETE SET NULL,
  CONSTRAINT fk_do_proyecto    FOREIGN KEY (id_proyecto)   REFERENCES proyecto (id_proyecto) ON DELETE SET NULL,
  CONSTRAINT fk_do_reunion     FOREIGN KEY (id_reunion)    REFERENCES reunion (id_reunion) ON DELETE SET NULL,
  CONSTRAINT fk_do_subido_por  FOREIGN KEY (id_subido_por) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Comentarios en proyectos o reuniones (con respuestas)
-- Regla (la valida el backend): exactamente uno de id_proyecto o
-- id_reunion. MySQL no permite CHECK sobre columnas con ON DELETE.
-- estado: visible | oculto
-- -------------------------------------------------------------
CREATE TABLE comentario (
  id_comentario       INT         NOT NULL AUTO_INCREMENT,
  id_usuario          INT         NOT NULL,
  id_proyecto         INT         DEFAULT NULL,
  id_reunion          INT         DEFAULT NULL,
  id_comentario_padre INT         DEFAULT NULL,
  contenido           TEXT        NOT NULL,
  fecha_comentario    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado              VARCHAR(20) NOT NULL DEFAULT 'visible',
  PRIMARY KEY (id_comentario),
  KEY fk_cm_usuario (id_usuario),
  KEY fk_cm_padre (id_comentario_padre),
  KEY idx_cm_proyecto (id_proyecto),
  KEY idx_cm_reunion (id_reunion),
  CONSTRAINT fk_cm_padre    FOREIGN KEY (id_comentario_padre) REFERENCES comentario (id_comentario) ON DELETE SET NULL,
  CONSTRAINT fk_cm_proyecto FOREIGN KEY (id_proyecto)         REFERENCES proyecto (id_proyecto) ON DELETE CASCADE,
  CONSTRAINT fk_cm_reunion  FOREIGN KEY (id_reunion)          REFERENCES reunion (id_reunion) ON DELETE CASCADE,
  CONSTRAINT fk_cm_usuario  FOREIGN KEY (id_usuario)          REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -------------------------------------------------------------
-- Calificaciones (1 a 5) de proyectos o reuniones
-- Regla (la valida el backend): exactamente uno de id_proyecto o
-- id_reunion.
-- -------------------------------------------------------------
CREATE TABLE calificacion (
  id_calificacion    INT       NOT NULL AUTO_INCREMENT,
  id_usuario         INT       NOT NULL,
  id_proyecto        INT       DEFAULT NULL,
  id_reunion         INT       DEFAULT NULL,
  puntaje            INT       NOT NULL,
  observacion        TEXT      DEFAULT NULL,
  fecha_calificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_calificacion),
  KEY fk_ca_usuario (id_usuario),
  KEY idx_ca_proyecto (id_proyecto),
  KEY idx_ca_reunion (id_reunion),
  CONSTRAINT chk_ca_puntaje CHECK (puntaje BETWEEN 1 AND 5),
  CONSTRAINT fk_ca_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyecto (id_proyecto) ON DELETE CASCADE,
  CONSTRAINT fk_ca_reunion  FOREIGN KEY (id_reunion)  REFERENCES reunion (id_reunion) ON DELETE CASCADE,
  CONSTRAINT fk_ca_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
