import { Component, input, output } from '@angular/core';

// Modal reutilizable para confirmar acciones (por ejemplo, eliminar).
// Uso:
//   <app-modal-confirmar
//     [abierto]="..." titulo="..." mensaje="..."
//     (confirmar)="..." (cancelar)="..." />
@Component({
  selector: 'app-modal-confirmar',
  templateUrl: './modal-confirmar.html',
  styleUrl: './modal-confirmar.css',
  host: {
    // Cerrar con la tecla Escape
    '(document:keydown.escape)': 'alPresionarEscape()',
  },
})
export class ModalConfirmar {
  // input(): datos que recibe del componente padre
  abierto = input(false);
  titulo = input('¿Estás seguro?');
  mensaje = input('');
  textoConfirmar = input('Eliminar');

  // output(): eventos que avisa al componente padre
  confirmar = output<void>();
  cancelar = output<void>();

  alPresionarEscape() {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }
}
