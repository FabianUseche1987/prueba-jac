import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { filaAUsuarioSesion, validarDatosRegistro } from '../models/usuario.model';
import { cifrarContrasena, compararContrasena, crearToken, estaCifrada } from '../seguridad';

// POST /api/auth/login
// Recibe { email, contrasena }. Si son correctos responde { token, usuario }.
export async function iniciarSesion(req: Request, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';

  if (!email || !contrasena) {
    res.status(400).json({ mensaje: 'Escribe tu correo y tu contraseña' });
    return;
  }

  // El usuario con su rol y su junta (LEFT JOIN: puede no tener rol ni junta)
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.contrasena_hash, u.estado,
            ur.id_junta, r.nombre_rol, r.es_directivo, j.nombre AS nombre_junta
     FROM usuario u
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario AND ur.estado = 'activo'
     LEFT JOIN rol r ON r.id_rol = ur.id_rol
     LEFT JOIN junta j ON j.id_junta = ur.id_junta
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

// GET /api/auth/juntas
// Lista pública para el formulario de registro: solo juntas activas y solo id, nombre y municipio.
export async function listarJuntasParaRegistro(req: Request, res: Response) {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT id_junta, nombre, municipio FROM junta WHERE estado = 'activa' ORDER BY nombre`,
  );
  res.json(filas.map((f) => ({ idJunta: f.id_junta, nombre: f.nombre, municipio: f.municipio })));
}

// POST /api/auth/registro
// Crea el usuario (contraseña cifrada) con el rol "Ciudadano común" en la junta elegida.
export async function registrarUsuario(req: Request, res: Response) {
  const { datos, errores } = validarDatosRegistro(req.body ?? {});
  if (!datos) {
    res.status(400).json({ mensaje: 'Revisa los datos del registro', errores });
    return;
  }

  // La junta debe existir y estar activa
  const [juntas] = await pool.query<RowDataPacket[]>(
    `SELECT id_junta FROM junta WHERE id_junta = ? AND estado = 'activa'`,
    [datos.idJunta],
  );
  if (juntas.length === 0) {
    res.status(400).json({ mensaje: 'La junta elegida no existe o está inactiva' });
    return;
  }

  // El correo y el documento no pueden estar ya registrados
  const [existentes] = await pool.query<RowDataPacket[]>(
    'SELECT email, numero_documento FROM usuario WHERE email = ? OR numero_documento = ?',
    [datos.email, datos.numeroDocumento],
  );
  if (existentes.some((u) => String(u.email).toLowerCase() === datos.email)) {
    res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?' });
    return;
  }
  if (existentes.length > 0) {
    res.status(409).json({ mensaje: 'Ya existe una cuenta con ese número de documento' });
    return;
  }

  const [roles] = await pool.query<RowDataPacket[]>(
    `SELECT id_rol FROM rol WHERE nombre_rol = 'Ciudadano común'`,
  );
  const hash = await cifrarContrasena(datos.contrasena);

  // Transacción: el usuario y su rol se guardan juntos.
  // Si algo falla en la mitad, rollback deshace todo (no queda un usuario sin rol).
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [nuevo] = await conexion.query<ResultSetHeader>(
      `INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, email, telefono, contrasena_hash, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [datos.nombre, datos.apellido, datos.tipoDocumento, datos.numeroDocumento, datos.email, datos.telefono, hash],
    );
    await conexion.query(
      `INSERT INTO usuario_rol (id_usuario, id_rol, id_junta, fecha_inicio, estado)
       VALUES (?, ?, ?, CURDATE(), 'activo')`,
      [nuevo.insertId, roles[0].id_rol, datos.idJunta],
    );

    await conexion.commit();
    res.status(201).json({ mensaje: 'Cuenta creada. Ya puedes iniciar sesión.', idUsuario: nuevo.insertId });
  } catch (error) {
    await conexion.rollback();
    // Si dos personas se registran con el mismo correo al mismo tiempo, la BD lo detecta
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo o número de documento' });
      return;
    }
    throw error;
  } finally {
    conexion.release();  // devolver la conexión al pool
  }
}
