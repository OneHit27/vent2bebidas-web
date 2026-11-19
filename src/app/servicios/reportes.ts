import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BebidaVendida } from '../modelos/reportes';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/reportes`;

  // GET /api/reportes/bebidas-mas-vendidas?limite=5 (VENDEDOR)
  // El cálculo lo hace la base de datos (JOIN + GROUP BY + SUM + COUNT)
  masVendidas(limite = 5) {
    const params = new HttpParams().set('limite', limite);
    return this.http.get<BebidaVendida[]>(`${this.url}/bebidas-mas-vendidas`, { params });
  }
}