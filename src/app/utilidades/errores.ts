import { HttpErrorResponse } from '@angular/common/http';

// Traduce el código HTTP del backend a un mensaje que una persona entienda.
// "recurso" sirve para el 404: "La bebida no existe.", "El envase no existe.", etc.
export function traducirError(err: HttpErrorResponse, recurso = 'El recurso'): string {
  const mensaje: string | undefined = err.error?.mensaje;
  const campos: Record<string, string> | undefined = err.error?.campos;

  switch (err.status) {
    case 0:
      return 'No hay conexión con el servidor. Revisa que el backend esté encendido.';
    case 400:
      return campos
        ? 'Revisa los datos: ' + Object.values(campos).join(' ')
        : 'Revisa los datos del formulario.';
    case 401:
      return 'Inicia sesión para continuar.';
    case 403:
      return 'Tu rol no tiene permiso para hacer esta operación.';
    case 404:
      return `${recurso} no existe.`;
    case 409:
      return mensaje ?? 'Ese dato ya está registrado.';
    case 422:
      // regla de negocio rota: el backend explica cuál en "mensaje"
      return mensaje ?? 'La operación no cumple las reglas del negocio.';
    default:
      return 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
  }
}