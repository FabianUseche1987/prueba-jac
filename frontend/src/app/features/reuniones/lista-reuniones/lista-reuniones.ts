import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ReunionesService } from '../reuniones.service';
import { Reunion } from '../models/reunion.model';

@Component({
  selector: 'app-lista-reuniones',
  imports: [DatePipe],
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
