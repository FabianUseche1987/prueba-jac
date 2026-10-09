import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Perfil } from './models/usuario.model';

// ----- Contraseñas (bcrypt) -----
// bcrypt convierte la contraseña en un "hash": un texto del que NO se puede
// recuperar la contraseña original. Para comprobar un login se compara la
// contraseña escrita con el hash guardado.

const RONDAS_BCRYPT = 10;  // más rondas = más seguro pero más lento; 10 es lo habitual

export function cifrarContrasena(contrasena: string): Promise<string> {
  return bcrypt.hash(contrasena, RONDAS_BCRYPT);
}

export function compararContrasena(contrasena: string, hash: string): Promise<boolean> {
  return bcrypt.compare(contrasena, hash);
}

// Los hash de bcrypt siempre empiezan por "$2" (por ejemplo "$2b$10$...")
export function estaCifrada(valor: string): boolean {
  return valor.startsWith('$2');
}

// ----- Tokens de sesión (JWT) -----
// Al iniciar sesión, la API entrega un token firmado con JWT_SECRET.
// El frontend lo envía en cada petición y así la API sabe quién es.

export interface DatosToken {
  idUsuario: number;
  perfil: Perfil;
  idJunta: number | null;
}

function secreto(): string {
  const clave = process.env.JWT_SECRET;
  if (!clave) {
    throw new Error('Falta JWT_SECRET en el archivo .env');
  }
  return clave;
}

export function crearToken(datos: DatosToken): string {
  const duracion = (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'];
  return jwt.sign(datos, secreto(), { expiresIn: duracion });
}

// Revisa la firma y la fecha de vencimiento del token y devuelve sus datos.
// Si el token fue alterado o ya venció, lanza un error.
export function leerToken(token: string): DatosToken {
  const contenido = jwt.verify(token, secreto(), { algorithms: ['HS256'] }) as jwt.JwtPayload;
  return {
    idUsuario: contenido.idUsuario,
    perfil: contenido.perfil,
    idJunta: contenido.idJunta,
  };
}
