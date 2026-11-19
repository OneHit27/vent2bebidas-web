// Espejo de PageResponse.java: así responde el backend cualquier listado paginado
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}