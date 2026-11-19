// Cuerpo JSON que devuelve GlobalExceptionHandler.java en cualquier error:
// { timestamp, status, error, mensaje, [campos] }
export interface ErrorApi {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  campos?: Record<string, string>; // solo en el 400 de validación: campo -> mensaje
}