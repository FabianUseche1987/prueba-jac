import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validaciones que comparten varios formularios.

// Letras (con tildes, ñ y ü) y espacios. Ej: "José Ángel", "Peña Muñoz", "Bogotá"
export const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

// Campo obligatorio. A diferencia de Validators.required, un texto con
// solo espacios ("     ") también cuenta como vacío.
// Devuelve el mismo error ('required') para poder usar hasError('required').
export function requerido(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  const vacio = typeof valor === 'string' ? valor.trim() === '' : valor === null || valor === undefined;
  return vacio ? { required: true } : null;
}
