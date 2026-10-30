import { Component, OnInit, inject, input, output } from '@angular/core';
import { formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Junta } from '../models/junta.model';
import { requerido, SOLO_LETRAS } from '../../../shared/utils/validadores';

// Nombre: letras (con tildes y ñ), números, espacios, punto y guion
const NOMBRE_JUNTA = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .\-]+$/;
// NIT: nueve dígitos y dígito de verificación, con o sin puntos (900.123.456-7 o 900123456-7)
const NIT = /^\d{3}\.?\d{3}\.?\d{3}-\d$/;
// Las Juntas de Acción Comunal existen desde la Ley 19 de 1958
const FECHA_MINIMA = '1958-01-01';

// Fecha de hoy en formato 'AAAA-MM-DD' (el mismo que usa <input type="date">)
function hoy(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
}

// La fundación no puede ser posterior a hoy ni anterior a 1958.
// Las fechas 'AAAA-MM-DD' se pueden comparar como texto.
function fechaFundacionValida(control: AbstractControl): ValidationErrors | null {
  const fecha = control.value;
  if (!fecha) {
    return null; // es opcional
  }
  if (fecha > hoy()) {
    return { fechaFutura: true };
  }
  if (fecha < FECHA_MINIMA) {
    return { fechaAntigua: true };
  }
  return null;
}

// Para comparar sin importar mayúsculas, tildes ni espacios de más:
// "  JAC  Barrio El Prógreso" -> "jac barrio el progreso"
function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita las tildes
    .replace(/\s+/g, ' ');
}

// Formulario en un modal para registrar o editar una junta.
// - Sin [junta]  -> modo "registrar" (formulario vacío)
// - Con [junta]  -> modo "editar" (formulario con los datos de esa junta)
@Component({
  selector: 'app-junta-form',
  imports: [ReactiveFormsModule],
  templateUrl: './junta-form.html',
  styleUrl: './junta-form.css',
  host: {
    // Cerrar con la tecla Escape
    '(document:keydown.escape)': 'cancelar.emit()',
  },
})
export class JuntaForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  junta = input<Junta | null>(null);
  // Juntas ya registradas, para no repetir una
  juntas = input<Junta[]>([]);

  guardar = output<Junta>();
  cancelar = output<void>();

  // Límites del calendario de "Fundación"
  readonly fechaMinima = FECHA_MINIMA;
  readonly fechaMaxima = hoy();

  // No puede haber otra junta con el mismo nombre en el mismo barrio y municipio
  private juntaDuplicada = (form: AbstractControl): ValidationErrors | null => {
    const { nombre, barrio, municipio } = form.value;
    if (!nombre?.trim() || !barrio?.trim() || !municipio?.trim()) {
      return null; // todavía faltan datos para comparar
    }
    const idActual = this.junta()?.idJunta; // al editar, no se compara consigo misma
    const repetida = this.juntas().some(
      (j) =>
        j.idJunta !== idActual &&
        normalizar(j.nombre) === normalizar(nombre) &&
        normalizar(j.barrio) === normalizar(barrio) &&
        normalizar(j.municipio) === normalizar(municipio),
    );
    return repetida ? { juntaDuplicada: true } : null;
  };

  // Reglas de validación (ver CU-09 en el documento de pruebas)
  form = this.fb.nonNullable.group(
    {
      nombre: [
        '',
        [requerido, Validators.pattern(NOMBRE_JUNTA), Validators.minLength(5), Validators.maxLength(100)],
      ],
      barrio: ['', [requerido, Validators.minLength(3), Validators.maxLength(80)]],
      municipio: [
        '',
        [requerido, Validators.pattern(SOLO_LETRAS), Validators.minLength(3), Validators.maxLength(60)],
      ],
      departamento: ['', [Validators.pattern(SOLO_LETRAS), Validators.maxLength(60)]],
      nit: ['', Validators.pattern(NIT)],
      representanteLegal: [
        '',
        [Validators.pattern(SOLO_LETRAS), Validators.minLength(2), Validators.maxLength(80)],
      ],
      fechaFundacion: ['', fechaFundacionValida],
      estado: this.fb.nonNullable.control<'activa' | 'inactiva'>('activa', Validators.required),
    },
    { validators: this.juntaDuplicada },
  );

  // ngOnInit se ejecuta una vez, cuando el componente aparece en pantalla
  ngOnInit() {
    const junta = this.junta();
    if (junta) {
      // Los campos que vienen en null se muestran vacíos
      this.form.setValue({
        nombre: junta.nombre,
        barrio: junta.barrio,
        municipio: junta.municipio,
        departamento: junta.departamento ?? '',
        nit: junta.nit ?? '',
        representanteLegal: junta.representanteLegal ?? '',
        fechaFundacion: junta.fechaFundacion ?? '',
        estado: junta.estado,
      });
    }
  }

  enviar() {
    // El botón está inactivo si el formulario es inválido; esto es solo por seguridad
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();

    // Los campos opcionales vacíos se guardan como null (igual que en la BD)
    this.guardar.emit({
      idJunta: this.junta()?.idJunta ?? 0, // si es nueva, el id lo asigna quien la guarda
      nombre: datos.nombre.trim(),
      barrio: datos.barrio.trim(),
      municipio: datos.municipio.trim(),
      departamento: datos.departamento.trim() || null,
      nit: datos.nit.trim() || null,
      representanteLegal: datos.representanteLegal.trim() || null,
      fechaFundacion: datos.fechaFundacion || null,
      estado: datos.estado,
    });
  }

  // Un campo se marca en rojo apenas se escribe en él (dirty) o al salir de él (touched)
  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
