import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Un interceptor se ejecuta en TODAS las peticiones HTTP de la app, antes de enviarlas.
// Este hace dos cosas:
//   1. Agrega el token de la sesión:  Authorization: Bearer <token>
//   2. Si la API responde 401 (sesión vencida o inválida), cierra la sesión y vuelve al inicio.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  // El token solo se envía a NUESTRA API, nunca a otros sitios
  const esNuestraApi = req.url.startsWith(environment.apiUrl);
  const peticion = token && esNuestraApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 en una petición que llevaba token = la sesión venció o ya no es válida
      if (error.status === 401 && token && esNuestraApi) {
        auth.logout();
        auth.avisoSesion.set(error.error?.mensaje ?? 'Tu sesión terminó. Inicia sesión de nuevo.');
        router.navigate(['/']);
      }
      // El error sigue su camino para que el componente también pueda manejarlo
      return throwError(() => error);
    }),
  );
};
