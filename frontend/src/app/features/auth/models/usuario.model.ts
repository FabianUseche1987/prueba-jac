// Perfil del usuario dentro de la app (ver docs/CONTEXTO.md, sección 7)
export type Perfil = 'administrador' | 'directivo' | 'ciudadano';

// Usuario con sesión iniciada, tal como lo envía la API.
// No incluye la contraseña: el frontend nunca la recibe.
export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  perfil: Perfil;
  rol: string | null;      // cargo: Presidente, Tesorero, Ciudadano común...
  idJunta: number | null;  // null para el administrador
  nombreJunta: string | null;
}

// Respuesta de POST /api/auth/login
export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

// Junta que se puede elegir al registrarse (GET /api/auth/juntas)
export interface JuntaOpcion {
  idJunta: number;
  nombre: string;
  municipio: string;
}

// Datos que se envían para crear una cuenta (POST /api/auth/registro)
export interface DatosRegistro {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  contrasena: string;
  idJunta: number;
  aceptaDatos: boolean;
}
