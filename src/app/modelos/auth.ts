// Espejo de LoginRequest.java (application/dto/request)
export interface LoginRequest {
  email: string;
  password: string;
}

// Espejo de TokenResponse.java (application/dto/response)
export interface TokenResponse {
  token: string;
  tipo: string;
  expiraEn: string;
  email: string;
  roles: string[];
}

// Roles que maneja el backend (claim "roles" del JWT)
export type Rol = 'COMPRADOR' | 'VENDEDOR';