import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { DatosToken } from '../seguridad';
import { Reunion, SELECT_REUNION, filaAReunion, validarDatosReunion } from '../models/reunion.model';

// La junta SIEMPRE se toma del token (res.locals.usuario), nunca de la URL ni del cuerpo:
// así nadie puede ver ni modificar reuniones de otra junta.

// ----- Funciones de apoyo -----

// Busca una reunión de una junta. Devuelve null si no existe o es de otra junta.
async function buscarReunion(idReunion: number, idJunta: number): Promise<Reunion | null> {
  const [filas] = await pool.query<RowDataPacket[]>(
    `${SELECT_REUNION} WHERE r.id_reunion = ? AND r.id_junta = ?`,
    [idReunion, idJunta],
  );
  return filas.length > 0 ? filaAReunion(filas[0]) : null;
}

// ----- Endpoints -----

// GET /api/reuniones
// Reuniones de la junta del usuario, de la más reciente a la más antigua.
export async function listarReuniones(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;

  if (usuario.idJunta === null) {
    res.json([]);  // un usuario sin junta no tiene reuniones
    return;
  }

  const [filas] = await pool.query<RowDataPacket[]>(
    `${SELECT_REUNION} WHERE r.id_junta = ? ORDER BY r.fecha_hora DESC`,
    [usuario.idJunta],
  );
  res.json(filas.map(filaAReunion));
}

// POST /api/reuniones (solo directivos)
// Convoca una reunión en la junta del directivo. Responde 201 con la reunión creada.
export async function crearReunion(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  if (usuario.idJunta === null) {
    res.status(403).json({ mensaje: 'No perteneces a ninguna junta' });
    return;
  }

  const { datos, errores } = validarDatosReunion(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos de la reunión', errores });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO reunion
       (id_junta, id_creador, tipo, titulo, orden_del_dia, fecha_hora, lugar, modalidad, estado, acta_resumen, quorum_requerido)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuario.idJunta, usuario.idUsuario, datos.tipo, datos.titulo, datos.ordenDelDia, datos.fechaHora,
     datos.lugar, datos.modalidad, datos.estado, datos.actaResumen, datos.quorumRequerido],
  );

  res.status(201).json(await buscarReunion(resultado.insertId, usuario.idJunta));
}

// PUT /api/reuniones/:id (solo directivos)
// Edita una reunión DE SU JUNTA. Si es de otra junta, responde 404 (como si no existiera).
export async function actualizarReunion(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  const idReunion = Number(req.params.id);
  if (!Number.isInteger(idReunion) || idReunion <= 0 || usuario.idJunta === null) {
    res.status(400).json({ mensaje: 'El id de la reunión no es válido' });
    return;
  }

  const { datos, errores } = validarDatosReunion(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos de la reunión', errores });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE reunion
     SET tipo = ?, titulo = ?, orden_del_dia = ?, fecha_hora = ?, lugar = ?, modalidad = ?,
         estado = ?, acta_resumen = ?, quorum_requerido = ?
     WHERE id_reunion = ? AND id_junta = ?`,
    [datos.tipo, datos.titulo, datos.ordenDelDia, datos.fechaHora, datos.lugar, datos.modalidad,
     datos.estado, datos.actaResumen, datos.quorumRequerido, idReunion, usuario.idJunta],
  );

  if (resultado.affectedRows === 0) {
    res.status(404).json({ mensaje: 'No existe esa reunión en tu junta' });
    return;
  }

  res.json(await buscarReunion(idReunion, usuario.idJunta));
}
