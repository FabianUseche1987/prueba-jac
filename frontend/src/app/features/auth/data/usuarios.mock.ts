import { Usuario } from '../models/usuario.model';

// Solo para pruebas: aquí el usuario lleva su contraseña para poder comparar.
// Cuando exista el backend, él valida la contraseña y este archivo se borra.
//   email           -> el "Usuario" con el que se inicia sesión
//   numeroDocumento -> para no registrar dos cuentas con el mismo documento
//   correo          -> para no registrar dos cuentas con el mismo correo
export interface UsuarioMock extends Usuario {
  contrasena: string;
  numeroDocumento: string;
  correo: string;
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
    numeroDocumento: '52111222',
    correo: 'adriana.guzman@correo.com',
  },
];
