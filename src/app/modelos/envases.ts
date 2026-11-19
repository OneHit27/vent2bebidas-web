import { MaterialEnvase } from './bebidas';

export type EstadoEnvase = 'NUEVO' | 'RETORNADO' | 'DANADO' | 'DESCARTADO';

// Espejo de RegistrarEnvaseRequest.java
export interface RegistrarEnvaseRequest {
  material: MaterialEnvase;
  capacidadMl: number;
  retornable: boolean;
}

// Espejo de EnvaseDetalleResponse.java
export interface Envase {
  id: string;
  material: MaterialEnvase;
  capacidadMl: number;
  retornable: boolean;
  estado: EstadoEnvase;
  cantidadUsos: number;
  usosRestantes: number;
}