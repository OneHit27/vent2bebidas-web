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
}