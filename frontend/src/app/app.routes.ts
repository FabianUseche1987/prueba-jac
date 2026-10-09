import { Routes } from '@angular/router';
import { Inicio } from './features/inicio/inicio';
import { ConsultaJuntas } from './features/juntas/consulta-juntas/consulta-juntas';
import { RecuperarContrasena } from './features/auth/recuperar-contrasena/recuperar-contrasena';
import { Registro } from './features/auth/registro/registro';
import { ListaReuniones } from './features/reuniones/lista-reuniones/lista-reuniones';
import { ListaAvisos } from './features/avisos/lista-avisos/lista-avisos';
import { rolGuard } from './features/auth/rol.guard';

// Guards disponibles:
//   authGuard               -> solo con sesión iniciada (cualquier perfil)
//   rolGuard('perfil', ...) -> solo con sesión Y uno de esos perfiles
export const routes: Routes = [
  { path: '', component: Inicio }, //Inicio
  { path: 'login', redirectTo: '' }, // el login está en el inicio
  { path: 'juntas', component: ConsultaJuntas, canActivate: [rolGuard('administrador')] },
  { path: 'reuniones', component: ListaReuniones, canActivate: [rolGuard('directivo', 'ciudadano')] },
  { path: 'avisos', component: ListaAvisos, canActivate: [rolGuard('directivo', 'ciudadano')] },
  { path: 'recuperar-contrasena', component: RecuperarContrasena },
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: '' } //cualquier otra, como /xyz	Redirige a Inicio
];
