import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosReunion, Reunion } from '../models/reunion.model';

// Formulario en un modal para convocar o editar una reunión (solo directivos).
// - Sin [reunion] -> convocar (formulario vacío)
// - Con [reunion] -> editar (además permite cambiar el estado y escribir el acta)
@Component({
  selector: 'app-reunion-form',
  imports: [ReactiveFormsModule],
  templateUrl: './reunion-form.html',
  styleUrl: './reunion-form.css',
  host: {
    '(document:keydown.escape)': 'cancelar.emit()',
  },
})
export class ReunionForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  reunion = input<Reunion | null>(null);
  guardando = input(false);
  error = input('');

  guardar = output<DatosReunion>();
  cancelar = output<void>();

  tipos = ['ordinaria', 'extraordinaria', 'directiva'];
  modalidades = ['presencial', 'virtual', 'mixta'];
  estados = ['programada', 'realizada', 'cancelada'];

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    tipo: ['ordinaria'],
    fechaHora: ['', Validators.required],
    modalidad: ['presencial'],
    lugar: ['', Validators.maxLength(200)],
    quorumRequerido: this.fb.control<number | null>(null, Validators.min(1)),
    ordenDelDia: [''],
    estado: ['programada'],
    actaResumen: [''],
  });

  ngOnInit() {
    const reunion = this.reunion();
    if (reunion) {
      this.form.setValue({
        titulo: reunion.titulo,
        tipo: reunion.tipo ?? 'ordinaria',
        // El campo de fecha y hora usa 'AAAA-MM-DDTHH:MM' (sin segundos)
        fechaHora: reunion.fechaHora.slice(0, 16),
        modalidad: reunion.modalidad ?? 'presencial',
        lugar: reunion.lugar ?? '',
        quorumRequerido: reunion.quorumRequerido,
        ordenDelDia: reunion.ordenDelDia ?? '',
        estado: reunion.estado,
        actaResumen: reunion.actaResumen ?? '',
      });
    }
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    // Los campos opcionales vacíos se envían como null
    this.guardar.emit({
      titulo: datos.titulo.trim(),
      tipo: datos.tipo,
      fechaHora: datos.fechaHora,
      modalidad: datos.modalidad,
      lugar: datos.lugar.trim() || null,
      quorumRequerido: datos.quorumRequerido,
      ordenDelDia: datos.ordenDelDia.trim() || null,
      estado: datos.estado,
      actaResumen: datos.actaResumen.trim() || null,
    });
  }

  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
