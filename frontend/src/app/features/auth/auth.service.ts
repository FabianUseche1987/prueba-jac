import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaLogin, Usuario } from './models/usuario.model';

const CLAVE_USUARIO = 'usuario';
const CLAVE_TOKEN = 'token';

// Maneja el inicio y cierre de sesión contra la API.
// providedIn: 'root' = un solo servicio compartido por toda la app.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;

  // Usuario con sesión iniciada (null si nadie ha ingresado).
  // Se lee de sessionStorage para no perder la sesión al recargar la página.
  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  readonly estaLogueado = computed(() => this.usuario() !== null);

  // Mensaje para mostrar en el login cuando la sesión terminó sola (por ejemplo, venció)
  readonly avisoSesion = signal('');

  // Token de la sesión: se enviará a la API en cada petición
  get token(): string | null {
    return sessionStorage.getItem(CLAVE_TOKEN);
  }

  // POST /api/auth/login
  // Si el correo y la contraseña son correctos, guarda el token y el usuario.
  login(email: string, contrasena: string): Observable<Usuario> {
    return this.http.post<RespuestaLogin>(`${this.url}/login`, { email, contrasena }).pipe(
      // tap: hace algo con la respuesta sin cambiarla (aquí, guardar la sesión)
      tap((respuesta) => {
        sessionStorage.setItem(CLAVE_TOKEN, respuesta.token);
        sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
        this.usuario.set(respuesta.usuario);
        this.avisoSesion.set('');
      }),
      // map: al componente solo le entregamos el usuario
      map((respuesta) => respuesta.usuario),
    );
  }

  logout() {
    this.usuario.set(null);
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
  }

  // Solo hay sesión si están guardados el usuario Y el token
  private leerUsuarioGuardado(): Usuario | null {
    const guardado = sessionStorage.getItem(CLAVE_USUARIO);
    if (!guardado || !sessionStorage.getItem(CLAVE_TOKEN)) {
      return null;
    }
    return JSON.parse(guardado);
  }
}
