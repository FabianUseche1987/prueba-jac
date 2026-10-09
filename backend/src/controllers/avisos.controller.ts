import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { DatosToken } from '../seguridad';
import { Aviso, SELECT_AVISOS_VISIBLES, filaAAviso, validarDatosAviso } from '../models/aviso.model';

// La junta y el perfil se toman SIEMPRE del token.
// "Leído" se guarda en notificacion_usuario: si no hay fila, el aviso cuenta como NO leído.

// ----- Funciones de apoyo -----

// Parámetros de SELECT_AVISOS_VISIBLES: idUsuario, idJunta, perfil
function parametros(usuario: DatosToken) {
  return [usuario.idUsuario, usuario.idJunta, usuario.perfil];
}

async function buscarAvisoVisible(idAviso: number, usuario: DatosToken): Promise<Aviso | null> {
  const [filas] = await pool.query<RowDataPacket[]>(
    `${SELECT_AVISOS_VISIBLES} AND n.id_notificacion = ?`,
    [...parametros(usuario), idAviso],
  );
  return filas.length > 0 ? filaAAviso(filas[0]) : null;
}

function leerId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ----- Endpoints -----

// GET /api/avisos -> avisos que el usuario puede ver, del más reciente al más antiguo
export async function listarAvisos(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  if (usuario.idJunta === null) {
    res.json([]);
    return;
  }
  const [filas] = await pool.query<RowDataPacket[]>(
    `${SELECT_AVISOS_VISIBLES} ORDER BY n.fecha_envio DESC`,
    parametros(usuario),
  );
  res.json(filas.map(filaAAviso));
}

// GET /api/avisos/no-leidos -> { cantidad } (para la campana del header)
export async function contarNoLeidos(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  if (usuario.idJunta === null) {
    res.json({ cantidad: 0 });
    return;
  }
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cantidad FROM (${SELECT_AVISOS_VISIBLES}) AS visibles WHERE visibles.leida = 0`,
    parametros(usuario),
  );
  res.json({ cantidad: Number(filas[0].cantidad) });
}

// PUT /api/avisos/:id/leido -> marca un aviso como leído por el usuario
export async function marcarLeido(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  const idAviso = leerId(req);
  if (!idAviso || !(await buscarAvisoVisible(idAviso, usuario))) {
    res.status(404).json({ mensaje: 'No existe ese aviso' });
    return;
  }
  // Si ya había fila, solo se actualiza (UNIQUE id_notificacion + id_usuario)
  await pool.query(
    `INSERT INTO notificacion_usuario (id_notificacion, id_usuario, leida, fecha_lectura)
     VALUES (?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE leida = 1, fecha_lectura = COALESCE(fecha_lectura, NOW())`,
    [idAviso, usuario.idUsuario],
  );
  res.status(204).send();
}

// PUT /api/avisos/leidos -> marca como leídos todos los avisos visibles
export async function marcarTodosLeidos(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  if (usuario.idJunta !== null) {
    await pool.query(
      `INSERT INTO notificacion_usuario (id_notificacion, id_usuario, leida, fecha_lectura)
       SELECT visibles.id_notificacion, ?, 1, NOW() FROM (${SELECT_AVISOS_VISIBLES}) AS visibles
       WHERE visibles.leida = 0
       ON DUPLICATE KEY UPDATE leida = 1, fecha_lectura = COALESCE(fecha_lectura, NOW())`,
      [usuario.idUsuario, ...parametros(usuario)],
    );
  }
  res.status(204).send();
}

// POST /api/avisos (solo directivos) -> publica un aviso en la junta
export async function crearAviso(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  if (usuario.idJunta === null) {
    res.status(403).json({ mensaje: 'No perteneces a ninguna junta' });
    return;
  }

  const { datos, errores } = validarDatosAviso(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos del aviso', errores });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO notificacion (id_junta, id_remitente, titulo, mensaje, tipo, prioridad, audiencia, fecha_expiracion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuario.idJunta, usuario.idUsuario, datos.titulo, datos.mensaje, datos.tipo,
     datos.prioridad, datos.audiencia, datos.fechaExpiracion],
  );

  // Quien lo publica ya lo leyó
  await pool.query(
    'INSERT INTO notificacion_usuario (id_notificacion, id_usuario, leida, fecha_lectura) VALUES (?, ?, 1, NOW())',
    [resultado.insertId, usuario.idUsuario],
  );

  res.status(201).json(await buscarAvisoVisible(resultado.insertId, usuario));
}

// DELETE /api/avisos/:id (solo directivos) -> elimina un aviso de su junta
export async function eliminarAviso(req: Request, res: Response) {
  const usuario = res.locals.usuario as DatosToken;
  const idAviso = leerId(req);
  if (!idAviso) {
    res.status(400).json({ mensaje: 'El id del aviso no es válido' });
    return;
  }
  // Sus lecturas (notificacion_usuario) se borran en cascada
  const [resultado] = await pool.query<ResultSetHeader>(
    'DELETE FROM notificacion WHERE id_notificacion = ? AND id_junta = ?',
    [idAviso, usuario.idJunta],
  );
  if (resultado.affectedRows === 0) {
    res.status(404).json({ mensaje: 'No existe ese aviso en tu junta' });
    return;
  }
  res.status(204).send();
}
