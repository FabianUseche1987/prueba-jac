import { Usuario } from '../models/usuario.model';

// Solo para pruebas: aquí el usuario lleva su contraseña para poder comparar.
// Cuando exista el backend, él valida la contraseña y este archivo se borra.
//   usuario         -> nombre de usuario con el que se inicia sesión (siempre en minúsculas)
//   numeroDocumento -> para no registrar dos cuentas con el mismo documento
export interface UsuarioMock extends Usuario {
  usuario: string;
  contrasena: string;
  numeroDocumento: string;
}

// Las cuentas creadas en "Regístrate" se agregan a esta lista (se pierden al recargar)
export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    idUsuario: 1,
    nombre: 'Adriana Guzmán',
    apellido: 'Demo',
    email: 'adriana.guzman@correo.com',
    telefono: null,
    estado: 'activo',
    usuario: 'adrianaguzman',
    contrasena: '3336089',
    numeroDocumento: '52111222',
  },
];
