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

// ----- Registro -----

// Datos que envía el formulario de registro (POST /api/auth/registro)
export interface DatosRegistro {
  nombre: string;
  apellido: string;
  tipoDocumento: 'CC' | 'TI' | 'CE';
  numeroDocumento: string;
  email: string;
  telefono: string;
  contrasena: string;
  idJunta: number;
}

function textoLimpio(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Revisa los datos del registro. El backend valida aunque el frontend ya lo haya hecho:
// cualquiera podría llamar a la API directamente, sin pasar por el formulario.
export function validarDatosRegistro(body: Record<string, unknown>): { datos: DatosRegistro | null; errores: string[] } {
  const errores: string[] = [];

  const datos = {
    nombre: textoLimpio(body.nombre),
    apellido: textoLimpio(body.apellido),
    tipoDocumento: textoLimpio(body.tipoDocumento),
    numeroDocumento: textoLimpio(body.numeroDocumento),
    email: textoLimpio(body.email).toLowerCase(),
    telefono: textoLimpio(body.telefono),
    contrasena: typeof body.contrasena === 'string' ? body.contrasena : '',  // la contraseña no se recorta
    idJunta: Number(body.idJunta),
  };

  if (!datos.nombre) errores.push('Los nombres son obligatorios');
  if (datos.nombre.length > 100) errores.push('Los nombres admiten máximo 100 caracteres');
  if (!datos.apellido) errores.push('Los apellidos son obligatorios');
  if (datos.apellido.length > 100) errores.push('Los apellidos admiten máximo 100 caracteres');
  if (!['CC', 'TI', 'CE'].includes(datos.tipoDocumento)) errores.push('El tipo de documento debe ser CC, TI o CE');
  if (!/^\d{5,12}$/.test(datos.numeroDocumento)) errores.push('El número de documento debe tener solo números, entre 5 y 12 dígitos');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email) || datos.email.length > 150) errores.push('El correo no es válido');
  if (!/^\d{10}$/.test(datos.telefono)) errores.push('El celular debe tener 10 dígitos');
  // bcrypt solo usa los primeros 72 caracteres, por eso el máximo
  if (datos.contrasena.length < 8 || datos.contrasena.length > 72) errores.push('La contraseña debe tener entre 8 y 72 caracteres');
  if (!Number.isInteger(datos.idJunta) || datos.idJunta <= 0) errores.push('Elige tu junta');
  if (body.aceptaDatos !== true) errores.push('Debes autorizar el tratamiento de tus datos personales');

  if (errores.length > 0) {
    return { datos: null, errores };
  }
  return { datos: datos as DatosRegistro, errores };
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
