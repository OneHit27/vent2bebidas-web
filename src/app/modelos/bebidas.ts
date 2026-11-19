// Espejos de los enums del dominio
export type MaterialEnvase = 'VIDRIO' | 'PLASTICO' | 'ALUMINIO';
export type GrupoAlcoholico = 'SIN_ALCOHOL' | 'FERMENTADA' | 'DESTILADA';
export type EstadoBebida = 'PUBLICADA' | 'ELIMINADA';

// Espejo de BebidaDetalleResponse.java
export interface Bebida {
  id: string;
  vendedorId: string;
  nombre: string;
  material: MaterialEnvase;
  capacidadMl: number;
  retornable: boolean;
  grupoAlcoholico: GrupoAlcoholico;
  monto: number;
  moneda: string;
  estado: EstadoBebida;
}

// Espejo de RegistrarBebidaRequest.java
export interface RegistrarBebidaRequest {
  nombre: string;
  material: MaterialEnvase;
  capacidadMl: number;
  retornable: boolean;
  grupoAlcoholico: GrupoAlcoholico;
  monto: number;
  moneda: string;
}