import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Junta } from '../models/junta.model';
import { JuntasService } from '../juntas.service';
import { JuntaForm } from '../junta-form/junta-form';
import { ModalConfirmar } from '../../../shared/components/modal-confirmar/modal-confirmar';

@Component({
  selector: 'app-consulta-juntas',
  imports: [DatePipe, FormsModule, JuntaForm, ModalConfirmar],
  templateUrl: './consulta-juntas.html',
  styleUrl: './consulta-juntas.css',
})
export class ConsultaJuntas implements OnInit {
  private readonly juntasService = inject(JuntasService);

  juntas: Junta[] = [];
  cargando = false;
  error = '';

  ngOnInit() {
    this.cargarJuntas();
  }

  // Pide las juntas a la API (GET /api/juntas)
  cargarJuntas() {
    this.cargando = true;
    this.error = '';

    // subscribe(): la petición se envía aquí; next llega con los datos, error si falla
    this.juntasService.listar().subscribe({
      next: (juntas) => {
        this.juntas = juntas;
        this.cargando = false;
        // Si la página actual quedó vacía (por ejemplo, tras eliminar), ir a la última
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: () => {
        this.error = 'No se pudieron cargar las juntas. Revisa que el backend esté encendido.';
        this.cargando = false;
      },
    });
  }

  // Paginación
  opcionesPorPagina = [5, 10, 15];
  porPagina = 5;
  paginaActual = 1;

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.juntas.length / this.porPagina));
  }

  // Lista con los números de página: [1, 2, 3, ...]
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Solo las juntas de la página actual
  get juntasPagina(): Junta[] {
    const inicio = (this.paginaActual - 1) * this.porPagina;
    return this.juntas.slice(inicio, inicio + this.porPagina);
  }

  // Para el texto "Mostrando 1–5 de 20"
  get desde(): number {
    return this.juntas.length === 0 ? 0 : (this.paginaActual - 1) * this.porPagina + 1;
  }

  get hasta(): number {
    return Math.min(this.paginaActual * this.porPagina, this.juntas.length);
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ----- Aviso arriba de la tabla (éxito o error) -----
  aviso: { tipo: 'success' | 'danger'; texto: string } | null = null;

  // Arma un mensaje claro a partir del error que devuelve la API
  private mensajeDeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No hay conexión con el servidor. Revisa que el backend esté encendido.';
    }
    const mensaje: string = err.error?.mensaje ?? 'Ocurrió un error inesperado.';
    const errores: string[] = err.error?.errores ?? [];
    return errores.length > 0 ? `${mensaje}: ${errores.join('. ')}.` : mensaje;
  }

  // ----- Formulario (registrar / editar) -----
  formularioAbierto = false;
  juntaAEditar: Junta | null = null; // null = registrar una nueva
  guardando = false;
  errorFormulario = '';

  registrar() {
    this.juntaAEditar = null;
    this.errorFormulario = '';
    this.formularioAbierto = true;
  }

  editar(junta: Junta) {
    this.juntaAEditar = junta;
    this.errorFormulario = '';
    this.formularioAbierto = true;
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.juntaAEditar = null;
  }

  // Recibe la junta que envía el formulario y la guarda en la BD
  guardarJunta(junta: Junta) {
    const editando = this.juntaAEditar !== null;
    this.guardando = true;
    this.errorFormulario = '';

    // Editar -> PUT; registrar -> POST
    const peticion = editando ? this.juntasService.actualizar(junta) : this.juntasService.crear(junta);

    peticion.subscribe({
      next: (guardada) => {
        this.guardando = false;
        this.cerrarFormulario();
        this.aviso = {
          tipo: 'success',
          texto: `Junta "${guardada.nombre}" ${editando ? 'actualizada' : 'registrada'} correctamente.`,
        };
        this.cargarJuntas(); // volver a leer la lista desde la BD
      },
      error: (err: HttpErrorResponse) => {
        // El modal sigue abierto para que no se pierda lo escrito
        this.guardando = false;
        this.errorFormulario = this.mensajeDeError(err);
      },
    });
  }

  // ----- Eliminar -----

  // Junta que se quiere eliminar (mientras tenga valor, el modal está abierto)
  juntaAEliminar: Junta | null = null;

  // Clic en el ícono de la papelera: solo abre el modal
  eliminar(junta: Junta) {
    this.juntaAEliminar = junta;
  }

  // Clic en "Eliminar" dentro del modal
  confirmarEliminar() {
    if (!this.juntaAEliminar) {
      return;
    }
    const junta = this.juntaAEliminar;
    this.juntaAEliminar = null; // cierra el modal

    this.juntasService.eliminar(junta.idJunta).subscribe({
      next: () => {
        this.aviso = { tipo: 'success', texto: `Junta "${junta.nombre}" eliminada.` };
        this.cargarJuntas();
      },
      error: (err: HttpErrorResponse) => {
        // Por ejemplo 409: la junta tiene usuarios o reuniones
        this.aviso = { tipo: 'danger', texto: this.mensajeDeError(err) };
      },
    });
  }
}
