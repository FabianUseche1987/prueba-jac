import { Routes } from '@angular/router';
import { Inicio } from './features/inicio/inicio';
import { Login } from './features/auth/login/login';
import { ConsultaJuntas } from './features/juntas/consulta-juntas/consulta-juntas';
import { DetalleJunta } from './features/juntas/detalle-junta/detalle-junta';
import { RecuperarContrasena } from './features/auth/recuperar-contrasena/recuperar-contrasena';

export const routes: Routes = [
  { path: '', component: Inicio }, //Inicio
  { path: 'login', component: Login },
  { path: 'juntas', component: ConsultaJuntas },
  { path: 'juntas/:id', component: DetalleJunta },
  { path: 'recuperar-contrasena', component: RecuperarContrasena },
  { path: '**', redirectTo: '' } //cualquier otra, como /xyz	Redirige a Inicio
];
