# Vent2Bebidas · Frontend (Angular)

Marketplace B2B de **bebidas con envases retornables**. Los vendedores publican sus bebidas y
controlan el ciclo de vida de cada envase; los compradores buscan, compran y pueden cancelar
una compra durante 24 horas.

Programación Avanzada 2026-2 · Universidad del Quindío · **Entrega 3: frontend conectado al backend**

- Backend (Entrega 2): https://github.com/JorgeLuisOcampo/vent2bebidas.git
- Frontend (este repositorio): https://github.com/OneHit27/vent2bebidas-web.git

## Integrantes

| Integrantes | 
|---|
| Juan David Torres Arango |
| Jorge Luis Ocampo Ocampo |
| Oscar Leandro Agudelo Franco |

## Cómo ejecutar

**1. Backend** (Java 21, desde el repositorio del backend):

```bash
cd backend
./gradlew bootRun       
```

Queda en http://localhost:8080 (Swagger en http://localhost:8080/swagger-ui.html).

**2. Frontend** (Node 22 o 24 y Angular CLI 22):

```bash
npm install
ng serve
```

Abrir http://localhost:4200. La URL de la API está en `src/environments/environment.development.ts`.

## Usuarios de prueba

| Correo | Contraseña | Rol | Para qué sirve |
|---|---|---|---|
| cerveceria@vent2bebidas.com | Vendedor123* | VENDEDOR | Dueño de las cervezas, la malta y el jugo |
| licores@vent2bebidas.com | Vendedor123* | VENDEDOR | Dueño del aguardiente y el ron |
| ana@vent2bebidas.com | Comprador123* | COMPRADOR | Mayor de edad con 5 compras: puede comprar más de 5 unidades |
| carlos@vent2bebidas.com | Comprador123* | COMPRADOR | Si pide más de 5 unidades rompe la regla de volumen (422) |
| sofia@vent2bebidas.com | Comprador123* | COMPRADOR | Menor de edad: si compra alcohol el backend responde 422 |

Envases de prueba (pantalla **Envases**): `e0000000-0000-0000-0000-000000000001` (nuevo),
`...0002` (plástico en su máximo de usos), `...0003` (dañado), `...0004` (aluminio), `...0005` (descartado).

## Pantallas

| Pantalla | Ruta | Acceso |
|---|---|---|
| Inicio | `/` | Público |
| Iniciar sesión | `/login` | Solo sin sesión (`guestGuard`) |
| Catálogo paginado con búsqueda y filtro | `/catalogo` | Con sesión (`authGuard`) |
| Comprar bebida | `/comprar/:id` | COMPRADOR (`rolGuard`) |
| Mis compras (historial, perfil y cancelación) | `/mis-compras` | COMPRADOR |
| Publicar bebida | `/publicar` | VENDEDOR |
| Envases retornables (funcionalidad propia) | `/envases` | VENDEDOR |
| Ranking de bebidas más vendidas | `/ranking` | VENDEDOR |

## Cómo está hecho

- **Interfaces espejo** de los DTOs del backend en `src/app/modelos`.
- **Un servicio por grupo de endpoints** en `src/app/servicios` (`AuthService`, `BebidasService`, `ComprasService`,
  `ConsumidoresService`, `EnvasesService`, `ReportesService`). Ningún componente escribe la URL de la API.
- **Interceptor** (`interceptores/auth-interceptor.ts`): agrega `Authorization: Bearer <token>` y, ante un 401,
  cierra la sesión, avisa y redirige al login.
- **Guards**: `authGuard`, `guestGuard` y `rolGuard`. Son una comodidad para el usuario; la seguridad real la
  aplica el backend (Spring Security con JWT).
- **Catálogo**: la paginación (`pagina`, `tamano`) y la búsqueda (`texto`, `grupo`) las resuelve el backend.
  La búsqueda es reactiva con Signals y espera 400 ms (debounce) antes de consultar.
- **Avisos**: `NotificacionesService` + componente `Notificaciones`, que desaparecen solos a los 4 segundos.
- **Errores HTTP** traducidos en `utilidades/errores.ts` (400, 401, 403, 404, 409, 422).
- **Bootstrap 5** y **Font Awesome** instalados por npm y registrados en `angular.json`.
