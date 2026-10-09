import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  menuAbierto = signal(false);

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  cerrarSesion() {
    this.auth.logout();
    this.cerrarMenu();
    this.router.navigate(['/']);
  }
}
