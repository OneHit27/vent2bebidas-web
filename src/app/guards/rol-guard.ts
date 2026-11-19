import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';
import { NotificacionesService } from '../servicios/notificaciones';
import { Rol } from '../modelos/auth';

// Lee el rol que pide la ruta en "data: { rol: 'VENDEDOR' }" y lo compara con el del token.
// Se usa junto con authGuard: canActivate: [authGuard, rolGuard]
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const avisos = inject(NotificacionesService);
  const rolRequerido = route.data['rol'] as Rol;

  if (auth.tieneRol(rolRequerido)) {
    return true;
  }
  avisos.error('Esa página no está disponible para tu rol.');
  return router.createUrlTree(['/catalogo']);
};