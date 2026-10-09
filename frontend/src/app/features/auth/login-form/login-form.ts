import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

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
  protected readonly auth = inject(AuthService);

  verContrasena = false;
  ingresando = false;
  errorLogin = '';

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
  });

  ingresar() {
    this.errorLogin = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.ingresando = true;
    const { correo, contrasena } = this.form.getRawValue();

    this.auth.login(correo, contrasena).subscribe({
      next: () => {
        this.ingresando = false;
        this.router.navigate(['/juntas']);
      },
      error: (err: HttpErrorResponse) => {
        this.ingresando = false;
        this.errorLogin =
          err.status === 0
            ? 'No hay conexión con el servidor. Intenta de nuevo en un momento.'
            : (err.error?.mensaje ?? 'No se pudo iniciar sesión.');
      },
    });
  }
}
