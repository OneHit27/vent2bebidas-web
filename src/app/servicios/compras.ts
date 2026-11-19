import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Compra, ConfirmarCompraRequest } from '../modelos/compras';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/compras`;

  // POST /api/compras (COMPRADOR). El consumidor NO va en el cuerpo: el backend lo saca del token.
  comprar(solicitud: ConfirmarCompraRequest) {
    return this.http.post<Compra>(this.url, solicitud);
  }

  // GET /api/compras/mias (COMPRADOR): de la más reciente a la más antigua
  mias() {
    return this.http.get<Compra[]>(`${this.url}/mias`);
  }

  // PUT /api/compras/{id}/cancelar (COMPRADOR dueño, máximo 24 horas después)
  cancelar(id: string) {
    return this.http.put<Compra>(`${this.url}/${id}/cancelar`, {});
  }
}