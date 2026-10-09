-- =============================================================
-- JAC Connect · Migración 001: correcciones de la Fase 0
-- =============================================================
-- Aplica las decisiones del paso 0.4 (ver docs/CONTEXTO.md, sección 9)
-- a la base de datos que YA EXISTE en Hostinger, SIN borrar datos.
-- Se ejecuta UNA sola vez.
--
-- Cómo ejecutarla en MySQL Workbench:
--   1. Haz un respaldo: Server → Data Export → Export to Self-Contained File.
--   2. Ejecuta la SECCIÓN 0 (solo consultas). TODAS deben devolver 0 filas.
--      Si alguna devuelve filas, avisa antes de seguir.
--   3. Ejecuta las secciones 1 a 6 en orden. Para cada una, selecciona su
--      texto y pulsa el rayo (Execute) o Ctrl+Shift+Enter.
--   4. Ejecuta la SECCIÓN 7 para comprobar que todo quedó bien.
-- =============================================================


-- -------------------------------------------------------------
-- SECCIÓN 0 · Verificación previa (cada consulta: 0 filas)
-- -------------------------------------------------------------
-- Estados con valores inesperados
SELECT id_junta, estado FROM junta WHERE estado NOT IN ('1', '0', 'activa', 'inactiva');
SELECT id_usuario, estado FROM usuario WHERE estado NOT IN ('1', '0', 'activo', 'inactivo');
SELECT id_usuario_rol, estado FROM usuario_rol WHERE estado NOT IN ('1', '0', 'activo', 'inactivo');

-- Usuarios con más de un rol (decisión 7: uno solo por usuario)
SELECT id_usuario, COUNT(*) AS roles FROM usuario_rol GROUP BY id_usuario HAVING COUNT(*) > 1;

-- Datos que no cumplirían las nuevas reglas (decisión 9)
SELECT * FROM calificacion WHERE puntaje NOT BETWEEN 1 AND 5;
SELECT * FROM avance_proyecto WHERE porcentaje_completado NOT BETWEEN 0 AND 100 OR monto_ejecutado < 0;

-- El correo del administrador de prueba no debe existir todavía
SELECT * FROM usuario WHERE email = 'admin@example.com';


-- -------------------------------------------------------------
-- SECCIÓN 1 · Estados en texto (decisión 1)
-- -------------------------------------------------------------
SET SQL_SAFE_UPDATES = 0;  -- Workbench bloquea los UPDATE que no filtran por clave

UPDATE junta       SET estado = 'activa'   WHERE estado = '1';
UPDATE junta       SET estado = 'inactiva' WHERE estado = '0';
UPDATE usuario     SET estado = 'activo'   WHERE estado = '1';
UPDATE usuario     SET estado = 'inactivo' WHERE estado = '0';
UPDATE usuario_rol SET estado = 'activo'   WHERE estado = '1';
UPDATE usuario_rol SET estado = 'inactivo' WHERE estado = '0';

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE junta       ADD CONSTRAINT chk_junta_estado   CHECK (estado IN ('activa', 'inactiva'));
ALTER TABLE usuario     ADD CONSTRAINT chk_usuario_estado CHECK (estado IN ('activo', 'inactivo'));
ALTER TABLE usuario_rol ADD CONSTRAINT chk_ur_estado      CHECK (estado IN ('activo', 'inactivo'));


-- -------------------------------------------------------------
-- SECCIÓN 2 · Documento de identidad en usuario (decisión 3)
-- Quedan NULL para los usuarios que ya existen.
-- -------------------------------------------------------------
ALTER TABLE usuario ADD COLUMN tipo_documento VARCHAR(5) NULL DEFAULT NULL AFTER apellido;
ALTER TABLE usuario ADD COLUMN numero_documento VARCHAR(20) NULL DEFAULT NULL AFTER tipo_documento;
ALTER TABLE usuario ADD UNIQUE KEY uq_usuario_documento (numero_documento);
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_tipo_doc CHECK (tipo_documento IN ('CC', 'TI', 'CE'));


-- -------------------------------------------------------------
-- SECCIÓN 3 · Administrador sin junta (decisión 5)
-- -------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;  -- la columna tiene llave foránea
ALTER TABLE usuario_rol MODIFY id_junta INT(11) NULL DEFAULT NULL;
SET FOREIGN_KEY_CHECKS = 1;


-- -------------------------------------------------------------
-- SECCIÓN 4 · Una sola junta y un solo rol por usuario (decisión 7)
-- Primero se crea el índice único y después se borra el anterior.
-- -------------------------------------------------------------
ALTER TABLE usuario_rol ADD UNIQUE KEY uq_ur_usuario (id_usuario);
ALTER TABLE usuario_rol DROP INDEX idx_ur_usuario;


-- -------------------------------------------------------------
-- SECCIÓN 5 · Collation igual al resto de tablas (decisión 8)
--           + reglas de valores (decisión 9)
-- La regla "proyecto O reunión" de comentario y calificacion la
-- valida el backend (MySQL no permite CHECK en columnas con ON DELETE).
-- -------------------------------------------------------------
ALTER TABLE calificacion CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;

ALTER TABLE calificacion    ADD CONSTRAINT chk_ca_puntaje    CHECK (puntaje BETWEEN 1 AND 5);
ALTER TABLE avance_proyecto ADD CONSTRAINT chk_av_porcentaje CHECK (porcentaje_completado BETWEEN 0 AND 100);
ALTER TABLE avance_proyecto ADD CONSTRAINT chk_av_monto      CHECK (monto_ejecutado >= 0);


-- -------------------------------------------------------------
-- SECCIÓN 6 · Usuario administrador de prueba
-- Contraseña temporal en texto plano: Jac2026*  (se cifra en la Fase 3)
-- -------------------------------------------------------------
INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, email, contrasena_hash, estado)
VALUES ('Administrador', 'JAC Connect', 'CC', '1000000015', 'admin@example.com', 'Jac2026*', 'activo');

INSERT INTO usuario_rol (id_usuario, id_rol, id_junta, fecha_inicio, estado)
SELECT u.id_usuario, r.id_rol, NULL, CURDATE(), 'activo'
FROM usuario u, rol r
WHERE u.email = 'admin@example.com' AND r.nombre_rol = 'Administrador';


-- -------------------------------------------------------------
-- SECCIÓN 7 · Comprobación final
-- -------------------------------------------------------------
-- Deben aparecer solo 'activa'/'inactiva' y 'activo'/'inactivo'
SELECT 'junta' AS tabla, estado, COUNT(*) AS cantidad FROM junta GROUP BY estado
UNION ALL SELECT 'usuario', estado, COUNT(*) FROM usuario GROUP BY estado
UNION ALL SELECT 'usuario_rol', estado, COUNT(*) FROM usuario_rol GROUP BY estado;

-- El administrador con su rol y SIN junta (id_junta = NULL)
SELECT u.email, r.nombre_rol, ur.id_junta
FROM usuario u
JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
JOIN rol r ON r.id_rol = ur.id_rol
WHERE u.email = 'admin@example.com';

-- Las nuevas columnas de usuario
SHOW COLUMNS FROM usuario;
