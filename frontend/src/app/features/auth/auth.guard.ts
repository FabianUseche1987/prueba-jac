import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Protege una ruta: solo deja entrar si hay sesión iniciada.
// Si no la hay, envía al inicio (donde está el formulario de login).
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.estaLogueado() ? true : router.createUrlTree(['/']);
};
