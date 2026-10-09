import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Junta } from './models/junta.model';

// Habla con la API de juntas del backend.
// Los componentes usan este servicio en lugar de llamar a la API directamente.
@Injectable({ providedIn: 'root' })
export class JuntasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/juntas`;

  // GET /api/juntas
  listar(): Observable<Junta[]> {
    return this.http.get<Junta[]>(this.url);
  }

  // POST /api/juntas -> devuelve la junta creada (con su id)
  crear(junta: Junta): Observable<Junta> {
    return this.http.post<Junta>(this.url, junta);
  }

  // PUT /api/juntas/:id -> devuelve la junta actualizada
  actualizar(junta: Junta): Observable<Junta> {
    return this.http.put<Junta>(`${this.url}/${junta.idJunta}`, junta);
  }

  // DELETE /api/juntas/:id
  eliminar(idJunta: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idJunta}`);
  }
}
