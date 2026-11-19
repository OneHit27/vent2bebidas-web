import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

// Deja pasar solo a quien tiene sesión. Si no, lo manda al login.
// OJO: es una comodidad para el usuario; la seguridad real la pone el backend
// (sin token válido la API responde 401 aunque alguien se salte el guard).
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

// Deja pasar a /login solo a quien NO tiene sesión. Si ya inició, lo manda al catálogo.
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/catalogo']);
};