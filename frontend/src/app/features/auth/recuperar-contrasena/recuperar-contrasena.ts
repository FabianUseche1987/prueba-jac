import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena {
  private readonly fb = inject(FormBuilder);

  enviado = signal(false);

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // TODO: llamar al backend para enviar el enlace de recuperación
    console.log('Recuperar contraseña', this.form.getRawValue());
    this.enviado.set(true);
  }

  intentarDeNuevo() {
    this.form.reset();
    this.enviado.set(false);
  }
}
