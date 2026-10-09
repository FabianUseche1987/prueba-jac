import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { COLUMNAS_JUNTA, filaAJunta } from '../models/junta.model';

// GET /api/juntas
// Devuelve todas las juntas ordenadas por nombre.
export async function listarJuntas(req: Request, res: Response) {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS_JUNTA} FROM junta ORDER BY nombre`,
  );
  res.json(filas.map(filaAJunta));
}
