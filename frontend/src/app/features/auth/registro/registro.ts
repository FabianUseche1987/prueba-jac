import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { JuntaOpcion } from '../models/usuario.model';
import { mensajeDeError } from '../../../shared/utils/mensaje-error';

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
export class Registro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  verContrasena = false;
  registrado = signal(false);
  enviando = false;
  errorRegistro = '';

  // Juntas que se pueden elegir (vienen de la API)
  juntas: JuntaOpcion[] = [];
  errorJuntas = '';

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
      idJunta: this.fb.control<number | null>(null, Validators.required),
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmarContrasena: ['', Validators.required],
      aceptaDatos: [false, Validators.requiredTrue],
    },
    { validators: contrasenasIguales },
  );

  ngOnInit() {
    this.auth.listarJuntasParaRegistro().subscribe({
      next: (juntas) => (this.juntas = juntas),
      error: () => (this.errorJuntas = 'No se pudieron cargar las juntas. Intenta de nuevo más tarde.'),
    });
  }

  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  confirmacionInvalida() {
    const confirmar = this.form.controls.confirmarContrasena;
    return confirmar.touched && (confirmar.invalid || this.form.hasError('contrasenasDiferentes'));
  }

  registrar() {
    this.errorRegistro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Los nombres de los campos del formulario se pasan a los que espera la API
    const valores = this.form.getRawValue();
    this.enviando = true;

    this.auth
      .registrar({
        nombre: valores.nombres,
        apellido: valores.apellidos,
        tipoDocumento: valores.tipoDocumento,
        numeroDocumento: valores.numeroDocumento,
        email: valores.correo,
        telefono: valores.celular,
        contrasena: valores.contrasena,
        idJunta: valores.idJunta!,  // "!": ya validamos que no es null
        aceptaDatos: valores.aceptaDatos,
      })
      .subscribe({
        next: () => {
          this.enviando = false;
          this.registrado.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.enviando = false;
          this.errorRegistro = mensajeDeError(err, 'No se pudo crear la cuenta.');
        },
      });
  }
}
