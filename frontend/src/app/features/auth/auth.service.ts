import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from './models/usuario.model';
import { USUARIOS_MOCK } from './data/usuarios.mock';

// Datos que llegan del formulario "Regístrate"
export interface DatosRegistro {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  correo: string;
  celular: string;
  contrasena: string;
}

const CLAVE_SESION = 'usuario';

// Maneja el inicio y cierre de sesión.
// providedIn: 'root' = un solo servicio compartido por toda la app.
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usuario con sesión iniciada (null si nadie ha ingresado).
  // Se lee de sessionStorage para no perder la sesión al recargar la página.
  readonly usuario = signal<Usuario | null>(this.leerSesion());

  readonly estaLogueado = computed(() => this.usuario() !== null);

  // Devuelve true si el usuario y la contraseña son correctos
  login(usuario: string, contrasena: string): boolean {
    // TODO: reemplazar por una petición HTTP al backend
    const encontrado = USUARIOS_MOCK.find(
      (u) => u.email === usuario.trim().toLowerCase() && u.contrasena === contrasena,
    );
    if (!encontrado) {
      return false;
    }

    // Quitamos la contraseña antes de guardar el usuario
    const { contrasena: _, ...datosUsuario } = encontrado;
    this.usuario.set(datosUsuario);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datosUsuario));
    return true;
  }

  logout() {
    this.usuario.set(null);
    sessionStorage.removeItem(CLAVE_SESION);
  }

  // ----- Registro (por ahora en memoria: las cuentas nuevas se pierden al recargar) -----

  existeDocumento(numeroDocumento: string): boolean {
    return USUARIOS_MOCK.some((u) => u.numeroDocumento === numeroDocumento.trim());
  }

  existeCorreo(correo: string): boolean {
    return USUARIOS_MOCK.some((u) => u.correo === correo.trim().toLowerCase());
  }

  // TODO: reemplazar por una petición HTTP al backend
  registrar(datos: DatosRegistro) {
    USUARIOS_MOCK.push({
      idUsuario: USUARIOS_MOCK.length + 1,
      nombre: datos.nombres,
      apellido: datos.apellidos,
      email: datos.correo,
      telefono: datos.celular,
      estado: 'activo',
      contrasena: datos.contrasena,
      numeroDocumento: datos.numeroDocumento,
      correo: datos.correo,
    });
  }

  private leerSesion(): Usuario | null {
    const guardado = sessionStorage.getItem(CLAVE_SESION);
    return guardado ? JSON.parse(guardado) : null;
  }
}
