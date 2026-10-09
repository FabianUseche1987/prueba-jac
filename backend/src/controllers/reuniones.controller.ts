import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { DatosToken } from '../seguridad';
import { filaAReunion } from '../models/reunion.model';

// GET /api/reuniones
// Devuelve las reuniones de LA JUNTA DEL USUARIO, de la más reciente a la más antigua.
// La junta se toma del token (no de la URL): así nadie puede ver las de otra junta.
export async function listarReuniones(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;

  if (usuario.idJunta === null) {
    res.json([]);  // un usuario sin junta no tiene reuniones
    return;
  }

  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT r.id_reunion, r.id_junta, r.tipo, r.titulo, r.orden_del_dia, r.fecha_hora, r.lugar,
            r.modalidad, r.estado, r.acta_resumen, r.quorum_requerido,
            CONCAT(TRIM(u.nombre), ' ', TRIM(u.apellido)) AS creada_por
     FROM reunion r
     JOIN usuario u ON u.id_usuario = r.id_creador
     WHERE r.id_junta = ?
     ORDER BY r.fecha_hora DESC`,
    [usuario.idJunta],
  );
  res.json(filas.map(filaAReunion));
}
