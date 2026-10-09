import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { COLUMNAS_JUNTA, Junta, filaAJunta, validarDatosJunta } from '../models/junta.model';

// Todas las consultas usan "?" en lugar de pegar los valores en el texto del SQL.
// mysql2 reemplaza cada "?" de forma segura: así se evita la inyección SQL.

// ----- Funciones de apoyo -----

// Busca una junta por su id. Devuelve null si no existe.
async function buscarJuntaPorId(id: number): Promise<Junta | null> {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS_JUNTA} FROM junta WHERE id_junta = ?`,
    [id],
  );
  return filas.length > 0 ? filaAJunta(filas[0]) : null;
}

// Lee el :id de la URL. Devuelve null si no es un número entero positivo.
function leerId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ----- Endpoints -----

// GET /api/juntas
// Devuelve todas las juntas ordenadas por nombre.
export async function listarJuntas(req: Request, res: Response) {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS_JUNTA} FROM junta ORDER BY nombre`,
  );
  res.json(filas.map(filaAJunta));
}

// POST /api/juntas
// Crea una junta. Responde 201 con la junta creada (ya con su id).
export async function crearJunta(req: Request, res: Response) {
  const { datos, errores } = validarDatosJunta(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos de la junta', errores });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO junta
       (nombre, barrio, municipio, departamento, nit, representante_legal, fecha_fundacion, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [datos.nombre, datos.barrio, datos.municipio, datos.departamento, datos.nit,
     datos.representanteLegal, datos.fechaFundacion, datos.estado],
  );

  // insertId = el id que MariaDB le asignó a la junta nueva
  res.status(201).json(await buscarJuntaPorId(resultado.insertId));
}

// PUT /api/juntas/:id
// Actualiza una junta. Responde con la junta ya actualizada.
export async function actualizarJunta(req: Request, res: Response) {
  const id = leerId(req);
  if (!id) {
    res.status(400).json({ mensaje: 'El id de la junta no es válido' });
    return;
  }

  const { datos, errores } = validarDatosJunta(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos de la junta', errores });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE junta
     SET nombre = ?, barrio = ?, municipio = ?, departamento = ?, nit = ?,
         representante_legal = ?, fecha_fundacion = ?, estado = ?
     WHERE id_junta = ?`,
    [datos.nombre, datos.barrio, datos.municipio, datos.departamento, datos.nit,
     datos.representanteLegal, datos.fechaFundacion, datos.estado, id],
  );

  // affectedRows = cuántas filas encontró el WHERE; 0 = esa junta no existe
  if (resultado.affectedRows === 0) {
    res.status(404).json({ mensaje: 'No existe una junta con ese id' });
    return;
  }

  res.json(await buscarJuntaPorId(id));
}

// DELETE /api/juntas/:id
// Elimina una junta, SOLO si no tiene datos relacionados.
// (Si los tiene, la BD los borraría en cascada: usuarios, reuniones, proyectos...)
export async function eliminarJunta(req: Request, res: Response) {
  const id = leerId(req);
  if (!id) {
    res.status(400).json({ mensaje: 'El id de la junta no es válido' });
    return;
  }

  const [conteo] = await pool.query<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM usuario_rol  WHERE id_junta = ?) +
       (SELECT COUNT(*) FROM reunion      WHERE id_junta = ?) +
       (SELECT COUNT(*) FROM proyecto     WHERE id_junta = ?) +
       (SELECT COUNT(*) FROM predio       WHERE id_junta = ?) +
       (SELECT COUNT(*) FROM notificacion WHERE id_junta = ?) AS relacionados`,
    [id, id, id, id, id],
  );
  if (Number(conteo[0].relacionados) > 0) {
    // 409 = conflicto: la acción choca con el estado de los datos
    res.status(409).json({
      mensaje: 'No se puede eliminar: la junta tiene usuarios, reuniones, proyectos u otros datos. Márcala como inactiva.',
    });
    return;
  }

  const [resultado] = await pool.query<ResultSetHeader>('DELETE FROM junta WHERE id_junta = ?', [id]);
  if (resultado.affectedRows === 0) {
    res.status(404).json({ mensaje: 'No existe una junta con ese id' });
    return;
  }

  // 204 = se hizo, y no hay nada que devolver
  res.status(204).send();
}
