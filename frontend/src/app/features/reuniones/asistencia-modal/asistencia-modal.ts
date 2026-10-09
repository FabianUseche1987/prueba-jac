import { Component, OnInit, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReunionesService } from '../reuniones.service';
import { Reunion } from '../models/reunion.model';
import { mensajeDeError } from '../../../shared/utils/mensaje-error';

// Una fila de la lista mientras el directivo la edita
interface FilaEditable {
  idUsuario: number;
  nombre: string;
  rol: string;
  asistio: boolean;
  horaLlegada: string;    // '' si no se escribió
  justificacion: string;  // '' si no se escribió
}

// Modal para tomar o corregir la asistencia de una reunión (solo directivos).
// Carga la lista de miembros al abrirse y la guarda en la API.
@Component({
  selector: 'app-asistencia-modal',
  imports: [DatePipe, FormsModule],
  templateUrl: './asistencia-modal.html',
  styleUrl: './asistencia-modal.css',
  host: {
    '(document:keydown.escape)': 'cancelar.emit()',
  },
})
export class AsistenciaModal implements OnInit {
  private readonly reunionesService = inject(ReunionesService);

  reunion = input.required<Reunion>();

  guardada = output<number>();  // avisa cuántas personas asistieron
  cancelar = output<void>();

  filas: FilaEditable[] = [];
  cargando = true;
  guardando = false;
  error = '';

  ngOnInit() {
    this.reunionesService.obtenerAsistencia(this.reunion().idReunion).subscribe({
      next: (lista) => {
        // Quien no tiene registro empieza como "no asistió"
        this.filas = lista.map((f) => ({
          idUsuario: f.idUsuario,
          nombre: f.nombre,
          rol: f.rol,
          asistio: f.asistio ?? false,
          horaLlegada: f.horaLlegada ?? '',
          justificacion: f.justificacion ?? '',
        }));
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeError(err, 'No se pudo cargar la lista de miembros.');
        this.cargando = false;
      },
    });
  }

  // Se recalculan solos cada vez que se marca o desmarca a alguien
  get presentes(): number {
    return this.filas.filter((f) => f.asistio).length;
  }

  get hayQuorum(): boolean {
    const quorum = this.reunion().quorumRequerido;
    return quorum === null || this.presentes >= quorum;
  }

  marcarTodos(asistio: boolean) {
    this.filas.forEach((f) => (f.asistio = asistio));
  }

  guardar() {
    this.guardando = true;
    this.error = '';

    const asistencia = this.filas.map((f) => ({
      idUsuario: f.idUsuario,
      asistio: f.asistio,
      horaLlegada: f.asistio && f.horaLlegada ? f.horaLlegada : null,
      justificacion: !f.asistio && f.justificacion.trim() ? f.justificacion.trim() : null,
    }));

    this.reunionesService.guardarAsistencia(this.reunion().idReunion, asistencia).subscribe({
      next: (lista) => {
        this.guardando = false;
        this.guardada.emit(lista.filter((f) => f.asistio).length);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = mensajeDeError(err);  // el modal sigue abierto
      },
    });
  }
}
