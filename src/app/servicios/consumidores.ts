import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Consumidor } from '../modelos/consumidores';

@Injectable({ providedIn: 'root' })
export class ConsumidoresService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/consumidores`;

  // GET /api/consumidores/yo (COMPRADOR): el perfil del dueño del token
  miPerfil() {
    return this.http.get<Consumidor>(`${this.url}/yo`);
  }
}