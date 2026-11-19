import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Comprar } from './componentes/comprar/comprar';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { PublicarBebida } from './componentes/publicar-bebida/publicar-bebida';
import { authGuard, guestGuard } from './guards/auth-guard';
import { rolGuard } from './guards/rol-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'catalogo', component: Catalogo, canActivate: [authGuard] },
  // Rutas del COMPRADOR
  { path: 'comprar/:id', component: Comprar, canActivate: [authGuard, rolGuard], data: { rol: 'COMPRADOR' } },
  { path: 'mis-compras', component: MisCompras, canActivate: [authGuard, rolGuard], data: { rol: 'COMPRADOR' } },
  // Rutas del VENDEDOR
  { path: 'publicar', component: PublicarBebida, canActivate: [authGuard, rolGuard], data: { rol: 'VENDEDOR' } },
  { path: '**', redirectTo: '' }
];