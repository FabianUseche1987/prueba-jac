import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reunion } from './models/reunion.model';

// Habla con la API de reuniones del backend
@Injectable({ providedIn: 'root' })
export class ReunionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reuniones`;

  // GET /api/reuniones -> las reuniones de la junta del usuario (la API la saca del token)
  listar(): Observable<Reunion[]> {
    return this.http.get<Reunion[]>(this.url);
  }
}
