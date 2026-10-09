import { Routes } from '@angular/router';
import { Inicio } from './features/inicio/inicio';
import { ConsultaJuntas } from './features/juntas/consulta-juntas/consulta-juntas';
import { RecuperarContrasena } from './features/auth/recuperar-contrasena/recuperar-contrasena';
import { Registro } from './features/auth/registro/registro';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: Inicio }, //Inicio
  { path: 'login', redirectTo: '' }, // el login está en el inicio
  // canActivate: solo se puede entrar con sesión iniciada
  { path: 'juntas', component: ConsultaJuntas, canActivate: [authGuard] },
  { path: 'recuperar-contrasena', component: RecuperarContrasena },
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: '' } //cualquier otra, como /xyz	Redirige a Inicio
];
