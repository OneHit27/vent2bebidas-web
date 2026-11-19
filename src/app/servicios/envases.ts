import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Envase, RegistrarEnvaseRequest } from '../modelos/envases';

// Ciclo de vida de los envases retornables (todo /api/envases es del VENDEDOR)
@Injectable({ providedIn: 'root' })
export class EnvasesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/envases`;

  registrar(solicitud: RegistrarEnvaseRequest) {
    return this.http.post<Envase>(this.url, solicitud);
  }

  obtener(id: string) {
    return this.http.get<Envase>(`${this.url}/${id}`);
  }

  registrarRetorno(id: string) {
    return this.http.put<Envase>(`${this.url}/${id}/retorno`, {});
  }

  marcarDanado(id: string) {
    return this.http.put<Envase>(`${this.url}/${id}/danado`, {});
  }

  descartar(id: string) {
    return this.http.put<Envase>(`${this.url}/${id}/descarte`, {});
  }
}