import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  // El backend exige rol COMPRADOR o VENDEDOR para GET /api/bebidas: la ruta es privada
  { path: 'catalogo', component: Catalogo, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];