import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DatosToken, leerToken } from '../seguridad';
import { Perfil } from '../models/usuario.model';

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

// Protege una ruta por perfil. Se usa DESPUÉS de verificarToken:
//   app.use('/api/juntas', verificarToken, requiereRol('administrador'), juntasRoutes);
// Si el perfil del usuario no está en la lista, responde 403.
export function requiereRol(...perfiles: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = res.locals.usuario as DatosToken | undefined;

    if (!usuario) {
      res.status(401).json({ mensaje: 'Debes iniciar sesión' });
      return;
    }
    if (!perfiles.includes(usuario.perfil)) {
      // 403 = sí sabemos quién es, pero no tiene permiso
      res.status(403).json({ mensaje: 'No tienes permiso para hacer esto' });
      return;
    }
    next();
  };
}
