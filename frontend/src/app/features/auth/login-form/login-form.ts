import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { USUARIOS_MOCK } from '../data/usuarios.mock';

// Formulario de inicio de sesión reutilizable (hoy se usa en el inicio).
@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  verContrasena = false;
  credencialesIncorrectas = false;

  // Se muestra en pantalla para que se pueda probar el login
  usuarioDemo = USUARIOS_MOCK[0];

  form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  ingresar() {
    this.credencialesIncorrectas = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { usuario, contrasena } = this.form.getRawValue();
    if (this.auth.login(usuario, contrasena)) {
      this.router.navigate(['/juntas']);
    } else {
      this.credencialesIncorrectas = true;
    }
  }
}
