import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { filaAUsuarioSesion } from '../models/usuario.model';
import { compararContrasena, crearToken, estaCifrada } from '../seguridad';

// POST /api/auth/login
// Recibe { email, contrasena }. Si son correctos responde { token, usuario }.
export async function iniciarSesion(req: Request, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';

  if (!email || !contrasena) {
    res.status(400).json({ mensaje: 'Escribe tu correo y tu contraseña' });
    return;
  }

  // El usuario con su rol y su junta (LEFT JOIN: puede no tener rol todavía)
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.contrasena_hash, u.estado,
            ur.id_junta, r.nombre_rol, r.es_directivo
     FROM usuario u
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario AND ur.estado = 'activo'
     LEFT JOIN rol r ON r.id_rol = ur.id_rol
     WHERE u.email = ?`,
    [email],
  );
  const fila = filas[0];

  // Mismo mensaje si el correo no existe o si la contraseña está mal:
  // así nadie puede averiguar qué correos están registrados.
  const credencialesValidas =
    fila !== undefined &&
    estaCifrada(fila.contrasena_hash) &&
    (await compararContrasena(contrasena, fila.contrasena_hash));

  if (!credencialesValidas) {
    res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    return;
  }

  if (fila.estado !== 'activo') {
    res.status(403).json({ mensaje: 'Tu cuenta está inactiva. Comunícate con la junta directiva.' });
    return;
  }

  await pool.query('UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?', [fila.id_usuario]);

  const usuario = filaAUsuarioSesion(fila);
  const token = crearToken({ idUsuario: usuario.idUsuario, perfil: usuario.perfil, idJunta: usuario.idJunta });

  res.json({ token, usuario });
}
