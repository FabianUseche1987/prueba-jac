import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { DatosToken } from '../seguridad';
import { FilaAsistencia, filaAAsistencia, validarAsistencia } from '../models/asistencia.model';

// ----- Funciones de apoyo -----

// true si la reunión existe y es de esa junta
async function reunionEsDeLaJunta(idReunion: number, idJunta: number): Promise<boolean> {
  const [filas] = await pool.query<RowDataPacket[]>(
    'SELECT id_reunion FROM reunion WHERE id_reunion = ? AND id_junta = ?',
    [idReunion, idJunta],
  );
  return filas.length > 0;
}

// Los miembros activos de la junta con su asistencia a la reunión.
// LEFT JOIN: si alguien no tiene registro, asistio llega como null.
async function listarAsistencia(idReunion: number, idJunta: number): Promise<FilaAsistencia[]> {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT u.id_usuario, CONCAT(TRIM(u.nombre), ' ', TRIM(u.apellido)) AS nombre, r.nombre_rol,
            a.asistio, a.hora_llegada, a.justificacion
     FROM usuario_rol ur
     JOIN usuario u ON u.id_usuario = ur.id_usuario
     JOIN rol r ON r.id_rol = ur.id_rol
     LEFT JOIN asistencia a ON a.id_usuario = u.id_usuario AND a.id_reunion = ?
     WHERE ur.id_junta = ? AND ur.estado = 'activo'
     ORDER BY r.es_directivo DESC, nombre`,
    [idReunion, idJunta],
  );
  return filas.map(filaAAsistencia);
}

// Lee el :id de la URL y revisa que la reunión sea de la junta del usuario.
// Si algo falla, responde el error y devuelve null.
async function leerReunion(req: Request, res: Response): Promise<{ idReunion: number; idJunta: number } | null> {
  const usuario = res.locals.usuario as DatosToken;
  const idReunion = Number(req.params.id);

  if (!Number.isInteger(idReunion) || idReunion <= 0 || usuario.idJunta === null) {
    res.status(400).json({ mensaje: 'El id de la reunión no es válido' });
    return null;
  }
  if (!(await reunionEsDeLaJunta(idReunion, usuario.idJunta))) {
    res.status(404).json({ mensaje: 'No existe esa reunión en tu junta' });
    return null;
  }
  return { idReunion, idJunta: usuario.idJunta };
}

// ----- Endpoints (solo directivos) -----

// GET /api/reuniones/:id/asistencia
export async function obtenerAsistencia(req: Request, res: Response) {
  const reunion = await leerReunion(req, res);
  if (!reunion) return;

  res.json(await listarAsistencia(reunion.idReunion, reunion.idJunta));
}

// PUT /api/reuniones/:id/asistencia
// Recibe { asistencia: [ { idUsuario, asistio, horaLlegada, justificacion } ] } y la guarda.
export async function guardarAsistencia(req: Request, res: Response) {
  const reunion = await leerReunion(req, res);
  if (!reunion) return;

  const { registros, errores } = validarAsistencia(req.body ?? {});
  if (!registros) {
    res.status(400).json({ mensaje: 'Revisa la lista de asistencia', errores });
    return;
  }

  // Solo se puede registrar a miembros de la junta
  const miembros = new Set((await listarAsistencia(reunion.idReunion, reunion.idJunta)).map((f) => f.idUsuario));
  if (registros.some((r) => !miembros.has(r.idUsuario))) {
    res.status(400).json({ mensaje: 'La lista incluye personas que no son miembros de la junta' });
    return;
  }

  // Transacción: se guarda toda la lista o nada.
  // ON DUPLICATE KEY UPDATE: si la persona ya tenía registro en esta reunión, lo actualiza.
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    for (const r of registros) {
      await conexion.query(
        `INSERT INTO asistencia (id_reunion, id_usuario, asistio, hora_llegada, justificacion)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE asistio = VALUES(asistio), hora_llegada = VALUES(hora_llegada),
                                 justificacion = VALUES(justificacion)`,
        [reunion.idReunion, r.idUsuario, r.asistio ? 1 : 0, r.horaLlegada, r.justificacion],
      );
    }
    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }

  res.json(await listarAsistencia(reunion.idReunion, reunion.idJunta));
}
