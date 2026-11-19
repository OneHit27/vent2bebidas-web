import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Bebida, GrupoAlcoholico, RegistrarBebidaRequest } from '../modelos/bebidas';
import { Pagina } from '../modelos/pagina';

// Un servicio por grupo de endpoints: todo lo de /api/bebidas pasa por aquí
@Injectable({ providedIn: 'root' })
export class BebidasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/bebidas`;

  // GET /api/bebidas?texto=&grupo=&pagina=&tamano=
  // La paginación y la búsqueda las hace el BACKEND (JPQL en BebidaJpaDataRepository.buscar)
  buscar(pagina = 0, tamano = 3, texto = '', grupo: GrupoAlcoholico | '' = '') {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (texto.trim()) {
      params = params.set('texto', texto.trim());
    }
    if (grupo) {
      params = params.set('grupo', grupo);
    }
    return this.http.get<Pagina<Bebida>>(this.url, { params });
  }

  // GET /api/bebidas/{id}
  obtener(id: string) {
    return this.http.get<Bebida>(`${this.url}/${id}`);
  }

  // POST /api/bebidas (VENDEDOR). El vendedor sale del token, no del cuerpo.
  registrar(solicitud: RegistrarBebidaRequest) {
    return this.http.post<Bebida>(this.url, solicitud);
  }

  // DELETE /api/bebidas/{id} (VENDEDOR dueño). Borrado lógico en el backend.
  eliminar(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}