import { Usuario } from '../models/usuario.model';

// Solo para pruebas: aquí el usuario lleva su contraseña para poder comparar.
// Cuando exista el backend, él valida la contraseña y este archivo se borra.
export interface UsuarioMock extends Usuario {
  contrasena: string;
}

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    idUsuario: 1,
    nombre: 'Adriana Guzmán',
    apellido: 'Demo',
    email: 'adrianaguzman',
    telefono: null,
    estado: 'activo',
    contrasena: '3336089',
  },
];
