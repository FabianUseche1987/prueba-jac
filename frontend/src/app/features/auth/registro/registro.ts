import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

// Valida que la contraseña y su confirmación sean iguales
function contrasenasIguales(form: AbstractControl): ValidationErrors | null {
  const { contrasena, confirmarContrasena } = form.value;
  return contrasena === confirmarContrasena ? null : { contrasenasDiferentes: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(FormBuilder);

  verContrasena = false;
  registrado = signal(false);

  tiposDocumento = [
    { valor: 'CC', texto: 'Cédula de ciudadanía' },
    { valor: 'TI', texto: 'Tarjeta de identidad' },
    { valor: 'CE', texto: 'Cédula de extranjería' },
  ];

  form = this.fb.nonNullable.group(
    {
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^\d{5,12}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', Validators.required],
      aceptaDatos: [false, Validators.requiredTrue],
    },
    { validators: contrasenasIguales },
  );

  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  confirmacionInvalida() {
    const confirmar = this.form.controls.confirmarContrasena;
    return confirmar.touched && (confirmar.invalid || this.form.hasError('contrasenasDiferentes'));
  }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // TODO: enviar los datos al backend para crear el usuario
    const { confirmarContrasena, ...usuario } = this.form.getRawValue();
    console.log('Registro', usuario);
    this.registrado.set(true);
  }
}
