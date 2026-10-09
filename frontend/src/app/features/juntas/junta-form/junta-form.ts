import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Junta } from '../models/junta.model';

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
  guardando = input(false);  // true mientras la API responde (desactiva el botón)
  error = input('');         // mensaje del servidor si algo falla al guardar

  guardar = output<Junta>();
  cancelar = output<void>();

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    barrio: ['', Validators.required],
    municipio: ['', Validators.required],
    departamento: [''],
    nit: [''],
    representanteLegal: [''],
    fechaFundacion: [''],
    estado: this.fb.nonNullable.control<'activa' | 'inactiva'>('activa'),
  });

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

  invalido(campo: string) {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
