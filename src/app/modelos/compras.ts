export type EstadoCompra = 'CONFIRMADA' | 'CANCELADA';

// Espejo de ConfirmarCompraRequest.java
export interface ConfirmarCompraRequest {
  bebidaId: string;
  unidades: number;
}

// Espejo de CompraResponse.java
export interface Compra {
  id: string;
  bebidaId: string;
  vendedorId: string;
  unidades: number;
  precioUnitario: number;
  moneda: string;
  total: number;
  fecha: string;
  estado: EstadoCompra;
}