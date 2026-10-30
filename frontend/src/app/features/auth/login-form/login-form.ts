import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { USUARIOS_MOCK } from '../data/usuarios.mock';
import { FORMATO_USUARIO, requerido } from '../../../shared/utils/validadores';

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

  // Reglas de validación (ver CU-07 en el documento de pruebas)
  form = this.fb.nonNullable.group({
    usuario: [
      '',
      [requerido, Validators.pattern(FORMATO_USUARIO), Validators.minLength(4), Validators.maxLength(50)],
    ],
    contrasena: ['', [requerido, Validators.maxLength(50)]],
  });

  // Un campo se marca en rojo apenas se escribe en él (dirty) o al salir de él (touched)
  invalido(campo: 'usuario' | 'contrasena') {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  ingresar() {
    this.credencialesIncorrectas = false;

    // El botón está inactivo si el formulario es inválido; esto es solo por seguridad
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
