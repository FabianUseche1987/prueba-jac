import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { leerToken } from '../seguridad';

// Protege una ruta: solo deja pasar peticiones con un token válido.
// El frontend envía el token en el encabezado:  Authorization: Bearer <token>
//
// Si el token es válido, guarda sus datos en res.locals.usuario
// (idUsuario, perfil, idJunta) para que los controladores sepan quién es.
export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const encabezado = req.headers.authorization ?? '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    // 401 = no se sabe quién es: hay que iniciar sesión
    res.status(401).json({ mensaje: 'Debes iniciar sesión' });
    return;
  }

  try {
    res.locals.usuario = leerToken(token);
    next();  // todo bien: sigue hacia la ruta
  } catch (error) {
    const mensaje =
      error instanceof jwt.TokenExpiredError
        ? 'Tu sesión venció. Inicia sesión de nuevo.'
        : 'Tu sesión no es válida. Inicia sesión de nuevo.';
    res.status(401).json({ mensaje });
  }
}
