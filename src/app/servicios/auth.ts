import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginRequest, Rol, TokenResponse } from '../modelos/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  // Estado de la sesión en señales: el menú y los guards reaccionan solos cuando cambian
  isAuthenticated = signal(!!localStorage.getItem('token'));
  roles = signal<string[]>(JSON.parse(localStorage.getItem('roles') ?? '[]'));
  email = signal(localStorage.getItem('email') ?? '');

  esComprador = computed(() => this.roles().includes('COMPRADOR'));
  esVendedor = computed(() => this.roles().includes('VENDEDOR'));

  login(credenciales: LoginRequest) {
    return this.http.post<TokenResponse>(`${this.url}/login`, credenciales);
  }

  guardarSesion(respuesta: TokenResponse): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('roles', JSON.stringify(respuesta.roles));
    localStorage.setItem('email', respuesta.email);
    this.roles.set(respuesta.roles);
    this.email.set(respuesta.email);
    this.isAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  tieneRol(rol: Rol): boolean {
    return this.roles().includes(rol);
  }

  // Id del vendedor o del consumidor: viaja en el claim "uid" del payload del JWT.
  // El payload se puede LEER (está en Base64), pero no se puede modificar sin romper la firma.
  usuarioId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).uid ?? null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('email');
    this.roles.set([]);
    this.email.set('');
    this.isAuthenticated.set(false);
  }
}