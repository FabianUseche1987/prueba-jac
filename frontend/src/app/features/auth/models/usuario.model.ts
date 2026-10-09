// Basado en la tabla `usuario` de la base de datos.
// No incluye `contrasena_hash`: el frontend nunca debe recibir la contraseña.
export interface Usuario {
  idUsuario: number;              // id_usuario
  nombre: string;                 // nombre
  apellido: string;               // apellido
  email: string;                  // email
  telefono: string | null;        // telefono
  estado: 'activo' | 'inactivo';  // estado
}
