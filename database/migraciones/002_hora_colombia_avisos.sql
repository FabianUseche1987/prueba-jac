-- =============================================================
-- JAC Connect · Migración 002: hora de Colombia en los avisos de prueba
-- =============================================================
-- Problema: las columnas TIMESTAMP (fecha_envio, fecha_expiracion...)
-- se guardan en hora universal (UTC) y MariaDB las convierte según la
-- zona horaria de la conexión. El servidor de Hostinger está en UTC,
-- así que los datos de prueba se guardaron como si fueran hora UTC y
-- en la aplicación (que usa hora de Colombia, -05:00) se veían
-- 5 horas antes: un aviso de las 9:00 a. m. aparecía a las 4:00 a. m.
--
-- Solución: volver a escribir esas fechas con la conexión en hora de
-- Colombia. Además, el aviso 3 vencía el 9 de octubre; se deja hasta
-- el 31 de octubre, igual que en seed.sql.
--
-- Se ejecuta UNA sola vez. Si se ejecuta dos veces no pasa nada:
-- escribe los mismos valores.
--
-- Valores anteriores (vistos en UTC), por si hay que deshacerla:
--   1: envío 2026-09-20 09:00:00, vence 2026-10-10 18:00:00
--   2: envío 2026-09-18 17:00:00
--   3: envío 2026-09-21 20:00:00, vence 2026-10-09 23:59:00
--   4: envío 2026-09-15 08:00:00
-- =============================================================

-- Todo lo que sigue se interpreta como hora de Colombia
SET time_zone = '-05:00';

UPDATE notificacion SET fecha_envio = '2026-09-20 09:00:00', fecha_expiracion = '2026-10-10 18:00:00' WHERE id_notificacion = 1;
UPDATE notificacion SET fecha_envio = '2026-09-18 17:00:00' WHERE id_notificacion = 2;
UPDATE notificacion SET fecha_envio = '2026-09-21 20:00:00', fecha_expiracion = '2026-10-31 23:59:00' WHERE id_notificacion = 3;
UPDATE notificacion SET fecha_envio = '2026-09-15 08:00:00' WHERE id_notificacion = 4;

-- Comprobación: deben verse las horas de arriba (09:00, 17:00, 20:00, 08:00)
SELECT id_notificacion, titulo, fecha_envio, fecha_expiracion FROM notificacion ORDER BY id_notificacion;
