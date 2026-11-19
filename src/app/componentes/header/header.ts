import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);

  // Señales del AuthService: cuando cambian, el menú se redibuja sin recargar la página
  isLoggedIn = this.authService.isAuthenticated;
  esComprador = this.authService.esComprador;
  esVendedor = this.authService.esVendedor;
  email = this.authService.email;

  cerrarSesion(): void {
    this.authService.logout();
    this.avisos.info('Cerraste sesión.');
    this.router.navigate(['/login']);
  }
}