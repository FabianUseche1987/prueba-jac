import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
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

  // ----- Formulario (registrar / editar) -----
  formularioAbierto = false;
  juntaAEditar: Junta | null = null; // null = registrar una nueva

  registrar() {
    this.juntaAEditar = null;
    this.formularioAbierto = true;
  }

  editar(junta: Junta) {
    this.juntaAEditar = junta;
    this.formularioAbierto = true;
  }

  cerrarFormulario() {
    this.formularioAbierto = false;
    this.juntaAEditar = null;
  }

  // Recibe la junta que envía el formulario
  guardarJunta(junta: Junta) {
    // TODO: enviar al backend; por ahora solo se actualiza la lista
    if (this.juntaAEditar) {
      // Editar: reemplazar la junta que tiene el mismo id
      this.juntas = this.juntas.map((j) => (j.idJunta === junta.idJunta ? junta : j));
    } else {
      // Registrar: nuevo id = el mayor + 1, y se agrega al inicio de la lista
      const nuevoId = Math.max(0, ...this.juntas.map((j) => j.idJunta)) + 1;
      this.juntas = [{ ...junta, idJunta: nuevoId }, ...this.juntas];
      this.paginaActual = 1; // para que se vea en la primera página
    }
    this.cerrarFormulario();
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

    // Por ahora solo se quita de la lista; luego se llamará al backend
    const id = this.juntaAEliminar.idJunta;
    this.juntas = this.juntas.filter((j) => j.idJunta !== id);
    this.juntaAEliminar = null;

    // Si la página quedó vacía, volver a la anterior
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }
  }
}
