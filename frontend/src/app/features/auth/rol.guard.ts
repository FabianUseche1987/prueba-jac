import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Perfil } from './models/usuario.model';

// Protege una ruta por perfil. Uso en app.routes.ts:
//   { path: 'juntas', component: ConsultaJuntas, canActivate: [rolGuard('administrador')] }
// Si no hay sesión, o el perfil no está en la lista, envía al inicio.
//
// OJO: esto solo organiza la navegación. La seguridad real la hace el backend
// (requiereRol responde 403 aunque alguien llame a la API directamente).
export function rolGuard(...perfiles: Perfil[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const usuario = auth.usuario();

    if (usuario && perfiles.includes(usuario.perfil)) {
      return true;
    }
    return router.createUrlTree(['/']);
  };
}
