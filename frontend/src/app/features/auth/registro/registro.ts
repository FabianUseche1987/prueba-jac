import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FORMATO_USUARIO, requerido, SOLO_LETRAS } from '../../../shared/utils/validadores';

// Formatos de los campos (expresiones regulares)
const SOLO_NUMEROS = /^\d+$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // algo@dominio.com
const CELULAR = /^3\d{9}$/; // 10 dígitos que empiezan por 3
const LETRAS_Y_NUMEROS = /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?=.*\d).+$/; // al menos una letra y un número

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
  private readonly auth = inject(AuthService);

  verContrasena = false;
  registrado = signal(false);

  tiposDocumento = [
    { valor: 'CC', texto: 'Cédula de ciudadanía' },
    { valor: 'TI', texto: 'Tarjeta de identidad' },
    { valor: 'CE', texto: 'Cédula de extranjería' },
  ];

  // El documento, el correo y el usuario no pueden estar ya registrados
  private documentoDisponible = (control: AbstractControl): ValidationErrors | null =>
    this.auth.existeDocumento(control.value) ? { yaRegistrado: true } : null;

  private correoDisponible = (control: AbstractControl): ValidationErrors | null =>
    this.auth.existeCorreo(control.value) ? { yaRegistrado: true } : null;

  private usuarioDisponible = (control: AbstractControl): ValidationErrors | null =>
    this.auth.existeUsuario(control.value) ? { yaRegistrado: true } : null;

  // Reglas de validación (ver CU-08 en el documento de pruebas)
  form = this.fb.nonNullable.group(
    {
      nombres: [
        '',
        [requerido, Validators.pattern(SOLO_LETRAS), Validators.minLength(2), Validators.maxLength(50)],
      ],
      apellidos: [
        '',
        [requerido, Validators.pattern(SOLO_LETRAS), Validators.minLength(2), Validators.maxLength(50)],
      ],
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: [
        '',
        [
          requerido,
          Validators.pattern(SOLO_NUMEROS),
          Validators.minLength(6),
          Validators.maxLength(10),
          this.documentoDisponible,
        ],
      ],
      correo: ['', [requerido, Validators.pattern(CORREO), Validators.maxLength(100), this.correoDisponible]],
      celular: ['', [requerido, Validators.pattern(CELULAR)]],
      // Mismas reglas que el campo Usuario del inicio de sesión
      usuario: [
        '',
        [
          requerido,
          Validators.pattern(FORMATO_USUARIO),
          Validators.minLength(4),
          Validators.maxLength(50),
          this.usuarioDisponible,
        ],
      ],
      contrasena: [
        '',
        [requerido, Validators.minLength(8), Validators.maxLength(50), Validators.pattern(LETRAS_Y_NUMEROS)],
      ],
      confirmarContrasena: ['', requerido],
      aceptaDatos: [false, Validators.requiredTrue],
    },
    { validators: contrasenasIguales },
  );

  // Un campo se marca en rojo apenas se escribe en él (dirty) o al salir de él (touched)
  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  confirmacionInvalida() {
    const confirmar = this.form.controls.confirmarContrasena;
    const usado = confirmar.dirty || confirmar.touched;
    return usado && (confirmar.invalid || this.form.hasError('contrasenasDiferentes'));
  }

  // La autorización se marca en rojo si ya se tocó la casilla,
  // o si es lo único que falta para poder registrarse
  autorizacionInvalida() {
    const autorizacion = this.form.controls.aceptaDatos;
    if (autorizacion.valid) {
      return false;
    }
    const loDemasValido = Object.entries(this.form.controls).every(
      ([nombre, control]) => nombre === 'aceptaDatos' || control.valid,
    );
    return autorizacion.dirty || autorizacion.touched || loDemasValido;
  }

  registrar() {
    // El botón está inactivo si el formulario es inválido; esto es solo por seguridad
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.auth.registrar({
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      numeroDocumento: datos.numeroDocumento.trim(),
      correo: datos.correo.trim().toLowerCase(),
      celular: datos.celular,
      usuario: datos.usuario.trim(),
      contrasena: datos.contrasena,
    });
    this.registrado.set(true);
  }
}
