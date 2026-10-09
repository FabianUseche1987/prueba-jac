import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Aviso, DatosAviso } from './models/aviso.model';

// Habla con la API de avisos. La junta y el perfil los toma la API del token.
@Injectable({ providedIn: 'root' })
export class AvisosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/avisos`;

  // Avisos sin leer del usuario. Lo usa la campana del header:
  // al cambiar aquí, el número del header se actualiza solo.
  readonly noLeidos = signal(0);

  // Pregunta a la API cuántos avisos sin leer hay y actualiza la signal
  actualizarNoLeidos() {
    this.http.get<{ cantidad: number }>(`${this.url}/no-leidos`).subscribe({
      next: (respuesta) => this.noLeidos.set(respuesta.cantidad),
      error: () => this.noLeidos.set(0),
    });
  }

  // GET /api/avisos
  listar(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.url);
  }

  // PUT /api/avisos/:id/leido
  marcarLeido(idAviso: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${idAviso}/leido`, {});
  }

  // PUT /api/avisos/leidos
  marcarTodosLeidos(): Observable<void> {
    return this.http.put<void>(`${this.url}/leidos`, {});
  }

  // POST /api/avisos (solo directivos)
  crear(datos: DatosAviso): Observable<Aviso> {
    return this.http.post<Aviso>(this.url, datos);
  }

  // DELETE /api/avisos/:id (solo directivos)
  eliminar(idAviso: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idAviso}`);
  }
}
