import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../features/auth/auth.service';
import { AvisosService } from '../../../features/avisos/avisos.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  menuAbierto = signal(false);

  constructor() {
    // Cada vez que se cambia de página, actualizar el número de avisos sin leer
    // (solo para directivos y ciudadanos: el administrador no tiene junta)
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      if (this.auth.estaLogueado() && !this.auth.esAdmin()) {
        this.avisos.actualizarNoLeidos();
      }
    });
  }

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  cerrarSesion() {
    this.auth.logout();
    this.avisos.noLeidos.set(0);
    this.cerrarMenu();
    this.router.navigate(['/']);
  }
}
