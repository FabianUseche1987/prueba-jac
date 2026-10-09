import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatosReunion, Reunion } from './models/reunion.model';

// Habla con la API de reuniones del backend.
// La junta no se envía: la API la toma del token del usuario.
@Injectable({ providedIn: 'root' })
export class ReunionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reuniones`;

  // GET /api/reuniones -> las reuniones de la junta del usuario
  listar(): Observable<Reunion[]> {
    return this.http.get<Reunion[]>(this.url);
  }

  // POST /api/reuniones (solo directivos) -> la reunión creada
  crear(datos: DatosReunion): Observable<Reunion> {
    return this.http.post<Reunion>(this.url, datos);
  }

  // PUT /api/reuniones/:id (solo directivos) -> la reunión actualizada
  actualizar(idReunion: number, datos: DatosReunion): Observable<Reunion> {
    return this.http.put<Reunion>(`${this.url}/${idReunion}`, datos);
  }
}
