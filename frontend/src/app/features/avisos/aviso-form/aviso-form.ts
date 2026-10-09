import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosAviso } from '../models/aviso.model';

// Formulario en un modal para publicar un aviso (solo directivos)
@Component({
  selector: 'app-aviso-form',
  imports: [ReactiveFormsModule],
  templateUrl: './aviso-form.html',
  styleUrl: './aviso-form.css',
  host: {
    '(document:keydown.escape)': 'cancelar.emit()',
  },
})
export class AvisoForm {
  private readonly fb = inject(FormBuilder);

  guardando = input(false);
  error = input('');

  guardar = output<DatosAviso>();
  cancelar = output<void>();

  tipos = [
    { valor: 'general', texto: 'General' },
    { valor: 'reunion', texto: 'Reunión' },
    { valor: 'proyecto', texto: 'Proyecto' },
  ];
  prioridades = [
    { valor: 'alta', texto: 'Alta' },
    { valor: 'media', texto: 'Media' },
    { valor: 'baja', texto: 'Baja' },
  ];
  audiencias = [
    { valor: 'todos', texto: 'Toda la junta' },
    { valor: 'directivos', texto: 'Solo directivos' },
  ];

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
    tipo: ['general'],
    prioridad: ['media'],
    audiencia: ['todos'],
    fechaExpiracion: [''],
  });

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    this.guardar.emit({
      titulo: datos.titulo.trim(),
      mensaje: datos.mensaje.trim(),
      tipo: datos.tipo,
      prioridad: datos.prioridad,
      audiencia: datos.audiencia,
      fechaExpiracion: datos.fechaExpiracion || null,
    });
  }

  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
