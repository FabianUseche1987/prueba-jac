import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validaciones que comparten varios formularios.

// Letras (con tildes, ñ y ü) y espacios. Ej: "José Ángel", "Peña Muñoz", "Bogotá"
export const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

// Nombre de usuario (login y registro): letras, números, punto (.) y guion bajo (_).
// Ej: "adrianaguzman", "luz.chaparro", "juan_23"
export const FORMATO_USUARIO = /^[A-Za-z0-9._]+$/;

// Campo obligatorio. A diferencia de Validators.required, un texto con
// solo espacios ("     ") también cuenta como vacío.
// Devuelve el mismo error ('required') para poder usar hasError('required').
export function requerido(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  const vacio = typeof valor === 'string' ? valor.trim() === '' : valor === null || valor === undefined;
  return vacio ? { required: true } : null;
}
