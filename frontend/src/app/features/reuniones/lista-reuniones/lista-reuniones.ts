import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { ReunionesService } from '../reuniones.service';
import { DatosReunion, Reunion } from '../models/reunion.model';
import { ReunionForm } from '../reunion-form/reunion-form';
import { AsistenciaModal } from '../asistencia-modal/asistencia-modal';
import { mensajeDeError } from '../../../shared/utils/mensaje-error';

@Component({
  selector: 'app-lista-reuniones',
  imports: [DatePipe, ReunionForm, AsistenciaModal],
  templateUrl: './lista-reuniones.html',
  styleUrl: './lista-reuniones.css',
})
export class ListaReuniones implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly reunionesService = inject(ReunionesService);

  reuniones: Reunion[] = [];
  cargando = false;
  error = '';

  pestana: 'proximas' | 'anteriores' = 'proximas';
  detalleAbierto: number | null = null;  // id de la reunión con el detalle abierto

  ngOnInit() {
    this.cargarReuniones();
  }

  cargarReuniones() {
    this.cargando = true;
    this.error = '';
    this.reunionesService.listar().subscribe({
      next: (reuniones) => {
        this.reuniones = reuniones;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las reuniones. Intenta de nuevo.';
        this.cargando = false;
      },
    });
  }

  // Próximas: de ahora en adelante, la más cercana primero
  get proximas(): Reunion[] {
    const ahora = Date.now();
    return this.reuniones
      .filter((r) => new Date(r.fechaHora).getTime() >= ahora)
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }

  // Anteriores: las que ya pasaron, la más reciente primero
  get anteriores(): Reunion[] {
    const ahora = Date.now();
    return this.reuniones.filter((r) => new Date(r.fechaHora).getTime() < ahora);
  }

  get reunionesPestana(): Reunion[] {
    return this.pestana === 'proximas' ? this.proximas : this.anteriores;
  }

  alternarDetalle(idReunion: number) {
    this.detalleAbierto = this.detalleAbierto === idReunion ? null : idReunion;
  }

  // ----- Convocar / editar (solo directivos) -----
  aviso: { tipo: 'success' | 'danger'; texto: string } | null = null;
  formularioAbierto = false;
  reunionAEditar: Reunion | null = null;  // null = convocar una nueva
  guardando = false;
  errorFormulario = '';

  convocar() {
    this.reunionAEditar = null;
    this.errorFormulario = '';
    this.formularioAbierto = true;
  }

  editar(reunion: Reunion) {
    this.reunionAEditar = reunion;
    this.errorFormulario = '';
    this.formularioAbierto = true;
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.reunionAEditar = null;
  }

  guardarReunion(datos: DatosReunion) {
    const editando = this.reunionAEditar !== null;
    this.guardando = true;
    this.errorFormulario = '';

    const peticion = this.reunionAEditar
      ? this.reunionesService.actualizar(this.reunionAEditar.idReunion, datos)
      : this.reunionesService.crear(datos);

    peticion.subscribe({
      next: (guardada) => {
        this.guardando = false;
        this.cerrarFormulario();
        this.aviso = {
          tipo: 'success',
          texto: `Reunión "${guardada.titulo}" ${editando ? 'actualizada' : 'convocada'} correctamente.`,
        };
        // Mostrar la pestaña donde quedó la reunión y abrir su detalle
        this.pestana = new Date(guardada.fechaHora).getTime() >= Date.now() ? 'proximas' : 'anteriores';
        this.detalleAbierto = guardada.idReunion;
        this.cargarReuniones();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.errorFormulario = mensajeDeError(err);  // el modal sigue abierto
      },
    });
  }

  // true si asistieron al menos las personas que pide el quórum (o si no se definió quórum)
  alcanzaQuorum(reunion: Reunion): boolean {
    return reunion.quorumRequerido === null || reunion.asistentes >= reunion.quorumRequerido;
  }

  // ----- Asistencia (solo directivos) -----
  reunionAsistencia: Reunion | null = null;  // mientras tenga valor, el modal está abierto

  abrirAsistencia(reunion: Reunion) {
    this.reunionAsistencia = reunion;
  }

  asistenciaGuardada(asistentes: number) {
    const titulo = this.reunionAsistencia?.titulo;
    this.reunionAsistencia = null;
    this.aviso = { tipo: 'success', texto: `Asistencia de "${titulo}" guardada: ${asistentes} personas asistieron.` };
    this.cargarReuniones();
  }

  // ----- Colores e íconos (clases de Bootstrap) -----

  claseTipo(tipo: string | null): string {
    switch (tipo) {
      case 'extraordinaria': return 'text-bg-warning';
      case 'directiva': return 'text-bg-info';
      default: return 'text-bg-primary';  // ordinaria
    }
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'realizada': return 'text-bg-secondary';
      case 'cancelada': return 'text-bg-danger';
      default: return 'text-bg-success';  // programada
    }
  }

  iconoModalidad(modalidad: string | null): string {
    switch (modalidad) {
      case 'virtual': return 'bi-camera-video';
      case 'mixta': return 'bi-laptop';
      default: return 'bi-geo-alt';  // presencial
    }
  }
}
