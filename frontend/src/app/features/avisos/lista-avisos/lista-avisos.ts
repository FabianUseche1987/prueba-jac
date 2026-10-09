import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AvisosService } from '../avisos.service';
import { Aviso, DatosAviso } from '../models/aviso.model';
import { AvisoForm } from '../aviso-form/aviso-form';
import { ModalConfirmar } from '../../../shared/components/modal-confirmar/modal-confirmar';
import { mensajeDeError } from '../../../shared/utils/mensaje-error';

@Component({
  selector: 'app-lista-avisos',
  imports: [DatePipe, AvisoForm, ModalConfirmar],
  templateUrl: './lista-avisos.html',
  styleUrl: './lista-avisos.css',
})
export class ListaAvisos implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly avisosService = inject(AvisosService);

  avisos: Aviso[] = [];
  cargando = false;
  error = '';
  filtro: 'todos' | 'sinLeer' = 'todos';
  aviso: { tipo: 'success' | 'danger'; texto: string } | null = null;  // mensaje arriba de la lista

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.cargando = true;
    this.error = '';
    this.avisosService.listar().subscribe({
      next: (avisos) => {
        this.avisos = avisos;
        this.cargando = false;
        this.avisosService.actualizarNoLeidos();  // la campana del header
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeError(err, 'No se pudieron cargar los avisos.');
        this.cargando = false;
      },
    });
  }

  get sinLeer(): number {
    return this.avisos.filter((a) => !a.leido).length;
  }

  get avisosFiltrados(): Aviso[] {
    return this.filtro === 'sinLeer' ? this.avisos.filter((a) => !a.leido) : this.avisos;
  }

  // ----- Leer -----

  marcarLeido(aviso: Aviso) {
    this.avisosService.marcarLeido(aviso.idAviso).subscribe({
      next: () => {
        aviso.leido = true;
        this.avisosService.actualizarNoLeidos();
      },
      error: (err: HttpErrorResponse) => (this.aviso = { tipo: 'danger', texto: mensajeDeError(err) }),
    });
  }

  marcarTodosLeidos() {
    this.avisosService.marcarTodosLeidos().subscribe({
      next: () => {
        this.avisos.forEach((a) => (a.leido = true));
        this.avisosService.actualizarNoLeidos();
      },
      error: (err: HttpErrorResponse) => (this.aviso = { tipo: 'danger', texto: mensajeDeError(err) }),
    });
  }

  // ----- Publicar (solo directivos) -----
  formularioAbierto = false;
  guardando = false;
  errorFormulario = '';

  publicar() {
    this.errorFormulario = '';
    this.formularioAbierto = true;
  }

  guardarAviso(datos: DatosAviso) {
    this.guardando = true;
    this.errorFormulario = '';
    this.avisosService.crear(datos).subscribe({
      next: (creado) => {
        this.guardando = false;
        this.formularioAbierto = false;
        this.filtro = 'todos';
        this.aviso = { tipo: 'success', texto: `Aviso "${creado.titulo}" publicado.` };
        this.cargarAvisos();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorFormulario = mensajeDeError(err);  // el modal sigue abierto
      },
    });
  }

  // ----- Eliminar (solo directivos) -----
  avisoAEliminar: Aviso | null = null;

  confirmarEliminar() {
    const avisoBorrar = this.avisoAEliminar;
    this.avisoAEliminar = null;
    if (!avisoBorrar) {
      return;
    }
    this.avisosService.eliminar(avisoBorrar.idAviso).subscribe({
      next: () => {
        this.aviso = { tipo: 'success', texto: `Aviso "${avisoBorrar.titulo}" eliminado.` };
        this.cargarAvisos();
      },
      error: (err: HttpErrorResponse) => (this.aviso = { tipo: 'danger', texto: mensajeDeError(err) }),
    });
  }

  // ----- Colores e íconos (clases de Bootstrap) -----

  clasePrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'alta': return 'text-bg-danger';
      case 'baja': return 'text-bg-secondary';
      default: return 'text-bg-warning';  // media
    }
  }

  iconoTipo(tipo: string): string {
    switch (tipo) {
      case 'reunion': return 'bi-calendar-event';
      case 'proyecto': return 'bi-house-heart';
      default: return 'bi-megaphone';  // general
    }
  }
}
