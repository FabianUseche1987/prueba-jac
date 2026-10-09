import { Request, Response } from 'express';
import { pool } from '../db';

// GET /api/salud
// Confirma que la API está funcionando y que la base de datos responde.
export async function obtenerSalud(req: Request, res: Response) {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, mensaje: 'API y base de datos funcionando' });
  } catch (error) {
    // 503 = el servicio no está disponible (aquí: no hay conexión con la BD)
    const detalle = error instanceof Error ? error.message : String(error);
    res.status(503).json({ ok: false, mensaje: 'No hay conexión con la base de datos', detalle });
  }
}
