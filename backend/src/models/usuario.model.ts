import { RowDataPacket } from 'mysql2';

// Perfil del usuario dentro de la app (ver docs/CONTEXTO.md, sección 7)
export type Perfil = 'administrador' | 'directivo' | 'ciudadano';

// Datos del usuario con sesión iniciada que se envían al frontend.
// NUNCA incluye la contraseña.
export interface UsuarioSesion {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  perfil: Perfil;
  rol: string | null;      // nombre del cargo: Presidente, Tesorero, Ciudadano común...
  idJunta: number | null;  // null para el administrador
}

// Calcula el perfil a partir del rol que tiene en usuario_rol
export function calcularPerfil(nombreRol: string | null, esDirectivo: number | null): Perfil {
  if (nombreRol === 'Administrador') {
    return 'administrador';
  }
  if (esDirectivo === 1) {
    return 'directivo';
  }
  return 'ciudadano';  // "Ciudadano común" o un usuario todavía sin rol
}

// Convierte la fila de la consulta de login en los datos de la sesión
export function filaAUsuarioSesion(fila: RowDataPacket): UsuarioSesion {
  return {
    idUsuario: fila.id_usuario,
    nombre: fila.nombre,
    apellido: fila.apellido,
    email: fila.email,
    telefono: fila.telefono,
    perfil: calcularPerfil(fila.nombre_rol, fila.es_directivo),
    rol: fila.nombre_rol,
    idJunta: fila.id_junta,
  };
}
