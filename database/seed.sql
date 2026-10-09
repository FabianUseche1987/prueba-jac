-- =============================================================
-- JAC Connect · Datos de prueba
-- =============================================================
-- Todos los datos son INVENTADOS (correos @example.com y teléfonos
-- 3000000xxx). Ejecutar después de schema.sql, con las tablas vacías.
--
-- Usuarios para probar cada rol (contraseña de todos: Jac2026*):
--   admin@example.com            Administrador (sin junta)
--   luz.pardo@example.com        Presidenta · JAC Barrio El Progreso (directivo)
--   luis.castro@example.com      Ciudadano  · JAC Barrio El Progreso
--   hector.mosquera@example.com  Presidente · JAC Barrio Calima (directivo)
--
-- Las contraseñas ya están cifradas con bcrypt: contrasena_hash guarda
-- el hash de "Jac2026*", nunca la contraseña en texto plano.
-- =============================================================

SET NAMES utf8mb4;

-- Las fechas de este archivo están en hora de Colombia. Sin esta línea,
-- las columnas TIMESTAMP las tomarían como hora UTC (la del servidor)
-- y en la aplicación se verían 5 horas antes.
SET time_zone = '-05:00';

-- -------------------------------------------------------------
-- Roles
-- -------------------------------------------------------------
INSERT INTO rol (id_rol, nombre_rol, descripcion, es_directivo) VALUES
  (1, 'Presidente',      'Representante legal y director de la junta',        1),
  (2, 'Vicepresidente',  'Apoya al presidente y lo reemplaza en su ausencia', 1),
  (3, 'Tesorero',        'Administra los recursos económicos de la junta',    1),
  (4, 'Secretario',      'Lleva el registro de actas y comunicaciones',       1),
  (5, 'Fiscal',          'Controla el cumplimiento de normas y estatutos',    1),
  (6, 'Vocal',           'Miembro activo de la junta directiva',              1),
  (7, 'Ciudadano común', 'Habitante del barrio registrado en el sistema',     0),
  (8, 'Administrador',   'Administrador técnico del sistema',                 0);

-- -------------------------------------------------------------
-- Juntas (las mismas 20 del mock del frontend)
-- Solo las juntas 1 y 2 tienen usuarios, reuniones y proyectos.
-- -------------------------------------------------------------
INSERT INTO junta (id_junta, nombre, barrio, municipio, departamento, nit, representante_legal, fecha_fundacion, estado) VALUES
  (1,  'JAC Barrio El Progreso',  'El Progreso',        'Bogotá',        'Cundinamarca',       '900.456.123-1', 'Luz Marina Pardo Gil',          '1985-03-15', 'activa'),
  (2,  'JAC Barrio Calima',       'Calima',             'Cali',          'Valle del Cauca',    '901.234.567-8', 'Héctor Fabio Mosquera Riascos', '1992-08-20', 'activa'),
  (3,  'JAC Villa del Río',       'Villa del Río',      'Bogotá',        'Cundinamarca',       '900.789.321-4', 'Sandra Milena Torres',          '1978-11-02', 'activa'),
  (4,  'JAC Manrique Central',    'Manrique Central',   'Medellín',      'Antioquia',          '890.987.654-3', 'Jorge Iván Restrepo',           '1970-05-10', 'activa'),
  (5,  'JAC Los Almendros',       'Los Almendros',      'Barranquilla',  'Atlántico',          NULL,            'Rosa Elena Pérez',              '2001-02-18', 'inactiva'),
  (6,  'JAC Vereda La Esperanza', 'La Esperanza',       'Fusagasugá',    'Cundinamarca',       '901.555.222-0', 'Luis Alberto Garzón',           '1998-09-27', 'activa'),
  (7,  'JAC San Fernando',        'San Fernando',       'Cali',          'Valle del Cauca',    NULL,            NULL,                            NULL,         'inactiva'),
  (8,  'JAC El Prado',            'El Prado',           'Bucaramanga',   'Santander',          '900.333.444-5', 'Martha Cecilia Rueda',          '1988-06-04', 'activa'),
  (9,  'JAC Kennedy Central',     'Kennedy Central',    'Bogotá',        'Cundinamarca',       '900.112.233-6', 'Ana Lucía Moreno',              '1983-04-12', 'activa'),
  (10, 'JAC Laureles',            'Laureles',           'Medellín',      'Antioquia',          '890.445.566-1', 'Diego Alejandro Ochoa',         '1975-10-30', 'activa'),
  (11, 'JAC El Recreo',           'El Recreo',          'Barranquilla',  'Atlántico',          '901.778.899-2', 'Yolanda Patricia Ruiz',         '1995-01-22', 'activa'),
  (12, 'JAC Vereda El Rosal',     'El Rosal',           'Subachoque',    'Cundinamarca',       NULL,            'Pedro Antonio Rincón',          '2003-07-08', 'activa'),
  (13, 'JAC Cabecera del Llano',  'Cabecera del Llano', 'Bucaramanga',   'Santander',          '900.667.788-9', 'Claudia Marcela Ardila',        '1981-12-05', 'activa'),
  (14, 'JAC Siloé',               'Siloé',              'Cali',          'Valle del Cauca',    '901.889.900-3', 'Wilson Andrés Caicedo',         '1990-03-17', 'inactiva'),
  (15, 'JAC Getsemaní',           'Getsemaní',          'Cartagena',     'Bolívar',            '900.221.334-7', 'María Fernanda Julio',          '1979-08-14', 'activa'),
  (16, 'JAC La Ceiba',            'La Ceiba',           'Cúcuta',        'Norte de Santander', NULL,            'Édgar Mauricio Peña',           '1999-11-21', 'activa'),
  (17, 'JAC Vereda San Isidro',   'San Isidro',         'Pasto',         'Nariño',             '901.334.556-4', 'Rosa María Benavides',          '2005-05-30', 'activa'),
  (18, 'JAC El Cable',            'El Cable',           'Manizales',     'Caldas',             '890.556.778-0', 'Andrés Felipe Giraldo',         '1972-02-09', 'activa'),
  (19, 'JAC La Esmeralda',        'La Esmeralda',       'Villavicencio', 'Meta',               NULL,            NULL,                            NULL,         'inactiva'),
  (20, 'JAC Santa Rita',          'Santa Rita',         'Ibagué',        'Tolima',             '900.998.877-5', 'Gloria Stella Varón',           '1987-09-03', 'activa');

-- -------------------------------------------------------------
-- Usuarios (contraseña de todos: Jac2026*, guardada como hash de bcrypt)
-- -------------------------------------------------------------
INSERT INTO usuario (id_usuario, nombre, apellido, tipo_documento, numero_documento, email, telefono, contrasena_hash, estado, fecha_registro) VALUES
  (1,  'Andrés Felipe',   'Rojas Mejía',      'CC', '1000000001', 'andres.rojas@example.com',    '3000000001', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-12 16:24:32'),
  (2,  'Natalia',         'Cárdenas Ruiz',    'CC', '1000000002', 'natalia.cardenas@example.com','3000000002', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-12 16:26:28'),
  (3,  'Luz Marina',      'Pardo Gil',        'CC', '1000000003', 'luz.pardo@example.com',       '3000000003', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-12 16:27:56'),
  (4,  'Camilo',          'Fuentes Lara',     'CC', '1000000004', 'camilo.fuentes@example.com',  '3000000004', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-16 00:54:36'),
  (5,  'Carlos Andrés',   'Ramírez Peña',     'CC', '1000000005', 'carlos.ramirez@example.com',  '3000000005', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-20 09:15:00'),
  (6,  'Martha Lucía',    'Gómez Rincón',     'CC', '1000000006', 'martha.gomez@example.com',    '3000000006', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-20 10:02:00'),
  (7,  'Jorge Eliécer',   'Moreno Díaz',      'CC', '1000000007', 'jorge.moreno@example.com',    '3000000007', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-21 14:30:00'),
  (8,  'Diana Marcela',   'Ortiz Cárdenas',   'CC', '1000000008', 'diana.ortiz@example.com',     '3000000008', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-22 08:45:00'),
  (9,  'Luis Fernando',   'Castro Vargas',    'CC', '1000000009', 'luis.castro@example.com',     '3000000009', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-25 19:10:00'),
  (10, 'Sandra Patricia', 'Rojas León',       'CC', '1000000010', 'sandra.rojas@example.com',    '3000000010', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-26 11:20:00'),
  (11, 'Héctor Fabio',    'Mosquera Riascos', 'CC', '1000000011', 'hector.mosquera@example.com', '3000000011', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-18 16:00:00'),
  (12, 'Paola Andrea',    'Valencia Cuero',   'CC', '1000000012', 'paola.valencia@example.com',  '3000000012', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-19 09:40:00'),
  (13, 'Óscar Iván',      'Quintero Lozano',  'CC', '1000000013', 'oscar.quintero@example.com',  '3000000013', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-07-02 13:25:00'),
  (14, 'Gloria Inés',     'Arboleda Muñoz',   'CC', '1000000014', 'gloria.arboleda@example.com', '3000000014', '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-07-03 17:50:00'),
  (15, 'Administrador',   'JAC Connect',      'CC', '1000000015', 'admin@example.com',           NULL,         '$2b$10$pW2M8vittxnvCHFB6svm5.mTRtLRCym0wKRXnwkEbz.K66g1aLbhC', 'activo', '2026-06-01 08:00:00');

-- -------------------------------------------------------------
-- Rol de cada usuario (uno por usuario)
-- -------------------------------------------------------------
INSERT INTO usuario_rol (id_usuario_rol, id_usuario, id_rol, id_junta, fecha_inicio, fecha_fin, estado) VALUES
  -- JAC Barrio El Progreso (junta 1)
  (1,  3,  1, 1,    '2026-06-12', NULL, 'activo'),  -- Presidenta
  (2,  1,  2, 1,    '2026-06-12', NULL, 'activo'),  -- Vicepresidente
  (3,  7,  3, 1,    '2026-06-21', NULL, 'activo'),  -- Tesorero
  (4,  5,  4, 1,    '2026-06-20', NULL, 'activo'),  -- Secretario
  (5,  6,  5, 1,    '2026-06-20', NULL, 'activo'),  -- Fiscal
  (6,  8,  6, 1,    '2026-06-22', NULL, 'activo'),  -- Vocal
  (7,  9,  7, 1,    '2026-06-25', NULL, 'activo'),  -- Ciudadano
  (8,  10, 7, 1,    '2026-06-26', NULL, 'activo'),  -- Ciudadana
  -- JAC Barrio Calima (junta 2)
  (9,  11, 1, 2,    '2026-06-18', NULL, 'activo'),  -- Presidente
  (10, 2,  3, 2,    '2026-06-12', NULL, 'activo'),  -- Tesorera
  (11, 12, 4, 2,    '2026-06-19', NULL, 'activo'),  -- Secretaria
  (12, 13, 7, 2,    '2026-07-02', NULL, 'activo'),  -- Ciudadano
  (13, 14, 7, 2,    '2026-07-03', NULL, 'activo'),  -- Ciudadana
  (14, 4,  7, 2,    '2026-06-16', NULL, 'activo'),  -- Ciudadano
  -- Administrador del sistema (sin junta)
  (15, 15, 8, NULL, '2026-06-01', NULL, 'activo');

-- -------------------------------------------------------------
-- Bienes comunales
-- -------------------------------------------------------------
INSERT INTO predio (id_predio, id_junta, nombre, descripcion, tipo_uso, area_m2, direccion, estado_juridico, estado_fisico, valor_catastral, matricula_inmobiliaria) VALUES
  (1, 1, 'Salón Comunal Barrio El Progreso', 'Salón principal para reuniones y eventos comunitarios', 'Reuniones y eventos', 120.50, 'Calle 45 # 23-10, Barrio El Progreso', 'Escriturado', 'Bueno', 85000000.00, '070-123456'),
  (2, 1, 'Cancha Deportiva', 'Cancha multifuncional para fútbol y microfútbol', 'Deporte y recreación', 450.00, 'Carrera 18 # 40-25, Barrio El Progreso', 'En trámite', 'Regular', 120000000.00, '070-789012'),
  (3, 1, 'Parque Infantil Los Sueños', 'Zona verde con juegos para niños del barrio', 'Recreación infantil', 200.00, 'Calle 43 # 20-15, Barrio El Progreso', 'Escriturado', 'Bueno', 95000000.00, '070-345678'),
  (4, 2, 'Caseta Comunal Calima', 'Caseta para reuniones, talleres y actividades culturales', 'Reuniones y eventos', 95.00, 'Carrera 7 # 5-32, Barrio Calima', 'Escriturado', 'Regular', 68000000.00, '370-456123'),
  (5, 2, 'Polideportivo Calima', 'Placa deportiva con graderías', 'Deporte y recreación', 520.00, 'Calle 6 # 8-10, Barrio Calima', 'Comodato', 'Bueno', 140000000.00, '370-789456');

-- -------------------------------------------------------------
-- Reuniones
-- -------------------------------------------------------------
INSERT INTO reunion (id_reunion, id_junta, id_creador, tipo, titulo, orden_del_dia, fecha_hora, lugar, modalidad, estado, acta_resumen, quorum_requerido) VALUES
  (1, 1, 3,  'ordinaria',      'Asamblea general ordinaria - julio',    '1. Verificación de quórum\n2. Informe de tesorería\n3. Aprobación remodelación salón\n4. Varios', '2026-07-18 18:00:00', 'Salón Comunal Barrio El Progreso', 'presencial', 'realizada',  'Se aprobó por mayoría el proyecto de remodelación del salón comunal.', 5),
  (2, 1, 5,  'directiva',      'Reunión de junta directiva - agosto',   '1. Seguimiento de proyectos\n2. Presupuesto iluminación cancha',                                    '2026-08-22 19:00:00', 'Google Meet',                      'virtual',    'realizada',  'Se aprobó el presupuesto de la iluminación LED de la cancha.', 4),
  (3, 1, 3,  'extraordinaria', 'Socialización proyecto de iluminación', '1. Presentación del proyecto\n2. Preguntas de la comunidad',                                        '2026-09-05 17:00:00', 'Cancha Deportiva',                 'presencial', 'realizada',  'La comunidad respaldó el proyecto y propuso horarios de uso nocturno.', 5),
  (4, 1, 5,  'ordinaria',      'Asamblea general ordinaria - octubre',  '1. Verificación de quórum\n2. Informe de avance de proyectos\n3. Huerta comunitaria\n4. Varios',  '2026-10-10 18:00:00', 'Salón Comunal Barrio El Progreso', 'presencial', 'programada', NULL, 5),
  (5, 2, 11, 'ordinaria',      'Asamblea general Calima - agosto',      '1. Informe escuela de fútbol\n2. Propuesta pavimentación Calle 5',                                   '2026-08-29 16:00:00', 'Caseta Comunal Calima',            'presencial', 'realizada',  'Se presentó el cierre de la escuela de fútbol y se aprobó gestionar la pavimentación.', 3),
  (6, 2, 12, 'directiva',      'Reunión directiva - gestión alcaldía',  '1. Documentos para radicar en alcaldía',                                                            '2026-10-17 10:00:00', 'Caseta Comunal Calima',            'mixta',      'programada', NULL, 2);

-- -------------------------------------------------------------
-- Asistencia
-- -------------------------------------------------------------
INSERT INTO asistencia (id_asistencia, id_reunion, id_usuario, asistio, hora_llegada, justificacion) VALUES
  (1, 1, 1, 1, '17:55:00', NULL), (2, 1, 3, 1, '17:40:00', NULL), (3, 1, 5, 1, '17:50:00', NULL),
  (4, 1, 6, 1, '18:05:00', NULL), (5, 1, 7, 1, '18:10:00', NULL), (6, 1, 8, 0, NULL, 'Cita médica'),
  (7, 1, 9, 1, '18:15:00', NULL), (8, 1, 10, 0, NULL, NULL),
  (9, 2, 1, 1, '19:00:00', NULL), (10, 2, 3, 1, '18:58:00', NULL), (11, 2, 5, 1, '19:02:00', NULL),
  (12, 2, 6, 0, NULL, 'Viaje de trabajo'), (13, 2, 7, 1, '19:05:00', NULL), (14, 2, 8, 1, '19:00:00', NULL),
  (15, 3, 3, 1, '16:50:00', NULL), (16, 3, 7, 1, '16:55:00', NULL), (17, 3, 9, 1, '17:05:00', NULL),
  (18, 3, 10, 1, '17:10:00', NULL), (19, 3, 1, 1, '17:00:00', NULL),
  (20, 5, 2, 1, '15:50:00', NULL), (21, 5, 11, 1, '15:45:00', NULL), (22, 5, 12, 1, '15:55:00', NULL),
  (23, 5, 13, 1, '16:10:00', NULL), (24, 5, 14, 0, NULL, 'Calamidad familiar');

-- -------------------------------------------------------------
-- Proyectos
-- -------------------------------------------------------------
INSERT INTO proyecto (id_proyecto, id_junta, id_responsable, codigo, nombre, descripcion, categoria, estado, presupuesto_total, presupuesto_ejecutado, fecha_inicio_plan, fecha_fin_plan, fecha_inicio_real, fecha_fin_real, prioridad) VALUES
  (1, 1, 3,  'PRY-2026-001', 'Remodelación del Salón Comunal', 'Cambio de cubierta, pintura, baños y cocina del salón comunal.',       'Infraestructura', 'en_ejecucion', 45000000.00,  18500000.00, '2026-07-01', '2026-11-30', '2026-07-15', NULL,         1),
  (2, 1, 7,  'PRY-2026-002', 'Iluminación LED de la cancha',   'Instalación de 8 reflectores LED para uso nocturno de la cancha.',    'Deporte',         'en_ejecucion', 28000000.00,  8400000.00,  '2026-08-01', '2026-10-31', '2026-08-10', NULL,         2),
  (3, 1, 8,  'PRY-2026-003', 'Huerta comunitaria',             'Huerta en el parque infantil con apoyo de colegios del sector.',      'Medio ambiente',  'planeado',     6500000.00,   0.00,        '2026-10-15', '2027-02-28', NULL,         NULL,         3),
  (4, 2, 11, 'PRY-2026-004', 'Pavimentación Calle 5',          'Gestión ante la alcaldía y cofinanciación para pavimentar la Calle 5.', 'Infraestructura', 'planeado',   120000000.00, 0.00,        '2027-01-15', '2027-06-30', NULL,         NULL,         1),
  (5, 2, 12, 'PRY-2026-005', 'Escuela de fútbol infantil',     'Entrenamientos gratuitos para niños de 7 a 14 años.',                 'Deporte',         'finalizado',   9000000.00,   8750000.00,  '2026-06-01', '2026-08-31', '2026-06-08', '2026-08-30', 2);

-- -------------------------------------------------------------
-- Avances de proyectos
-- -------------------------------------------------------------
INSERT INTO avance_proyecto (id_avance, id_proyecto, id_reporta, descripcion, porcentaje_completado, monto_ejecutado, fecha_reporte, tipo_avance) VALUES
  (1, 1, 3,  'Compra de tejas y estructura metálica para la cubierta.',   15,  5000000.00, '2026-07-30 18:00:00', 'compra'),
  (2, 1, 7,  'Instalación de la cubierta terminada.',                     30,  7000000.00, '2026-08-25 17:30:00', 'obra'),
  (3, 1, 3,  'Remodelación de baños al 50%.',                             41,  6500000.00, '2026-09-18 16:45:00', 'obra'),
  (4, 2, 7,  'Compra e instalación de postes y 3 reflectores.',           30,  8400000.00, '2026-09-10 12:00:00', 'obra'),
  (5, 5, 12, 'Compra de uniformes y balones, inicio de entrenamientos.',  60,  5000000.00, '2026-07-01 10:00:00', 'compra'),
  (6, 5, 12, 'Cierre con torneo interbarrial e informe final.',          100,  3750000.00, '2026-08-30 19:00:00', 'informe');

-- -------------------------------------------------------------
-- Avisos
-- -------------------------------------------------------------
INSERT INTO notificacion (id_notificacion, id_junta, id_remitente, titulo, mensaje, tipo, prioridad, audiencia, fecha_envio, fecha_expiracion) VALUES
  (1, 1, 3,  'Convocatoria asamblea de octubre',  'Se convoca a todos los afiliados a la asamblea general el 10 de octubre a las 6:00 p. m. en el salón comunal.', 'reunion',  'alta',  'todos',      '2026-09-20 09:00:00', '2026-10-10 18:00:00'),
  (2, 1, 7,  'Avance remodelación del salón',     'La remodelación del salón comunal va en 41%. Ya está lista la cubierta.',                                       'proyecto', 'media', 'todos',      '2026-09-18 17:00:00', NULL),
  (3, 1, 5,  'Documentos para reunión directiva', 'Por favor revisar el borrador del informe de gestión antes de la asamblea.',                                     'general',  'media', 'directivos', '2026-09-21 20:00:00', '2026-10-31 23:59:00'),
  (4, 2, 11, 'Gestión pavimentación Calle 5',     'Se radicará la solicitud ante la alcaldía. Quien tenga fotos del estado de la vía, por favor compartirlas.',    'proyecto', 'baja',  'todos',      '2026-09-15 08:00:00', NULL);

-- -------------------------------------------------------------
-- Lectura de avisos
-- -------------------------------------------------------------
INSERT INTO notificacion_usuario (id_notif_usuario, id_notificacion, id_usuario, leida, fecha_lectura) VALUES
  (1, 1, 1, 1, '2026-09-20 12:30:00'), (2, 1, 3, 1, '2026-09-20 09:05:00'), (3, 1, 5, 1, '2026-09-20 10:00:00'),
  (4, 1, 6, 0, NULL), (5, 1, 7, 1, '2026-09-21 07:45:00'), (6, 1, 8, 0, NULL),
  (7, 1, 9, 1, '2026-09-20 19:20:00'), (8, 1, 10, 0, NULL),
  (9, 2, 1, 1, '2026-09-18 18:00:00'), (10, 2, 3, 1, '2026-09-18 17:05:00'), (11, 2, 5, 0, NULL),
  (12, 2, 6, 0, NULL), (13, 2, 7, 1, '2026-09-18 17:00:00'), (14, 2, 8, 0, NULL),
  (15, 2, 9, 1, '2026-09-19 20:10:00'), (16, 2, 10, 0, NULL),
  (17, 3, 1, 0, NULL), (18, 3, 3, 1, '2026-09-21 20:30:00'), (19, 3, 5, 1, '2026-09-21 20:00:00'),
  (20, 3, 6, 0, NULL), (21, 3, 7, 0, NULL), (22, 3, 8, 1, '2026-09-22 08:15:00'),
  (23, 4, 2, 1, '2026-09-15 12:00:00'), (24, 4, 11, 1, '2026-09-15 08:00:00'), (25, 4, 12, 1, '2026-09-15 09:30:00'),
  (26, 4, 13, 0, NULL), (27, 4, 14, 0, NULL), (28, 4, 4, 0, NULL);

-- -------------------------------------------------------------
-- Documentos
-- -------------------------------------------------------------
INSERT INTO documento (id_documento, id_proyecto, id_reunion, id_predio, id_subido_por, nombre_archivo, tipo_documento, ruta_archivo, tamano_bytes, fecha_subida) VALUES
  (1, NULL, 1,    NULL, 5,  'acta_asamblea_julio_2026.pdf',     'acta',       'uploads/actas/acta_asamblea_julio_2026.pdf',          245760,  '2026-07-20 10:00:00'),
  (2, NULL, 2,    NULL, 5,  'acta_directiva_agosto_2026.pdf',   'acta',       'uploads/actas/acta_directiva_agosto_2026.pdf',        198400,  '2026-08-23 09:30:00'),
  (3, 1,    NULL, NULL, 3,  'cotizacion_cubierta.pdf',          'cotizacion', 'uploads/proyectos/1/cotizacion_cubierta.pdf',         512000,  '2026-07-10 15:00:00'),
  (4, 2,    NULL, NULL, 7,  'foto_reflectores.jpg',             'fotografia', 'uploads/proyectos/2/foto_reflectores.jpg',            1843200, '2026-09-10 12:10:00'),
  (5, 5,    NULL, NULL, 12, 'informe_final_escuela_futbol.pdf', 'informe',    'uploads/proyectos/5/informe_final_escuela_futbol.pdf', 734003, '2026-08-31 11:00:00'),
  (6, NULL, NULL, 1,    3,  'escritura_salon_comunal.pdf',      'escritura',  'uploads/predios/1/escritura_salon_comunal.pdf',       1048576, '2026-06-30 14:00:00');

-- -------------------------------------------------------------
-- Comentarios (los que tienen id_comentario_padre son respuestas)
-- -------------------------------------------------------------
INSERT INTO comentario (id_comentario, id_usuario, id_proyecto, id_reunion, id_comentario_padre, contenido, fecha_comentario, estado) VALUES
  (1, 9,  1,    NULL, NULL, '¿Para cuándo estaría listo el salón? Queremos hacer la novena de diciembre ahí.',        '2026-09-19 20:15:00', 'visible'),
  (2, 3,  1,    NULL, 1,    'La idea es entregarlo a finales de noviembre, así que sí alcanzaría.',                  '2026-09-20 08:30:00', 'visible'),
  (3, 10, 2,    NULL, NULL, 'Excelente proyecto, la cancha de noche es muy oscura.',                                 '2026-09-11 21:00:00', 'visible'),
  (4, 6,  NULL, 1,    NULL, 'Solicito que en la próxima asamblea se presente el informe de tesorería por escrito.', '2026-07-19 09:00:00', 'visible'),
  (5, 13, 5,    NULL, NULL, '¿Habrá escuela de fútbol el próximo año?',                                              '2026-09-01 18:40:00', 'visible'),
  (6, 11, 5,    NULL, 5,    'Estamos buscando recursos para repetirla en 2027.',                                     '2026-09-02 07:50:00', 'visible');

-- -------------------------------------------------------------
-- Calificaciones
-- -------------------------------------------------------------
INSERT INTO calificacion (id_calificacion, id_usuario, id_proyecto, id_reunion, puntaje, observacion, fecha_calificacion) VALUES
  (1, 9,  1,    NULL, 4, 'Buen avance, falta informar más seguido.',   '2026-09-19 20:20:00'),
  (2, 10, 2,    NULL, 5, 'Muy necesario para el barrio.',              '2026-09-11 21:05:00'),
  (3, 13, 5,    NULL, 5, 'Los niños quedaron felices.',                '2026-09-01 18:45:00'),
  (4, 14, 5,    NULL, 4, NULL,                                         '2026-09-03 12:00:00'),
  (5, 9,  NULL, 1,    4, 'Reunión organizada, pero empezó tarde.',     '2026-07-19 10:00:00'),
  (6, 6,  NULL, 1,    3, 'Faltó el informe de tesorería por escrito.', '2026-07-19 09:05:00'),
  (7, 13, NULL, 5,    5, NULL,                                         '2026-08-30 08:00:00');
