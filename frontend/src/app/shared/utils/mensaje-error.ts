import { HttpErrorResponse } from '@angular/common/http';

// Arma un mensaje claro para el usuario a partir del error que devuelve la API.
// La API responde { mensaje, errores? }; si no hay conexión, el status es 0.
export function mensajeDeError(err: HttpErrorResponse, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (err.status === 0) {
    return 'No hay conexión con el servidor. Intenta de nuevo en un momento.';
  }
  const mensaje: string = err.error?.mensaje ?? porDefecto;
  const errores: string[] = err.error?.errores ?? [];
  return errores.length > 0 ? `${mensaje}: ${errores.join('. ')}.` : mensaje;
}
