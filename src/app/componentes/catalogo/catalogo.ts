import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { BebidasService } from '../../servicios/bebidas';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { Bebida, GrupoAlcoholico } from '../../modelos/bebidas';
import { Pagina } from '../../modelos/pagina';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo {
  private bebidasService = inject(BebidasService);
  private auth = inject(AuthService);
  private avisos = inject(NotificacionesService);

  readonly tamano = 3; // 7 bebidas publicadas en data.sql -> 3 páginas
  readonly grupos: { valor: GrupoAlcoholico | ''; texto: string }[] = [
    { valor: '', texto: 'Todos los grupos' },
    { valor: 'SIN_ALCOHOL', texto: 'Sin alcohol' },
    { valor: 'FERMENTADA', texto: 'Fermentadas' },
    { valor: 'DESTILADA', texto: 'Destiladas' }
  ];

  esComprador = this.auth.esComprador;
  esVendedor = this.auth.esVendedor;
  private miId = this.auth.usuarioId();

  // Estado de la pantalla en señales
  pagina = signal(0);
  texto = signal('');
  grupo = signal<GrupoAlcoholico | ''>('');
  private recarga = signal(0); // se incrementa para volver a pedir la página actual

  // Espera 400 ms después de la última tecla antes de buscar (debounce)
  busqueda = toSignal(
    toObservable(this.texto).pipe(debounceTime(400), distinctUntilChanged()),
    { initialValue: '' }
  );

  // Junta todos los filtros en un solo objeto: si cambia cualquiera, se pide de nuevo al backend
  private consulta = computed(() => ({
    pagina: this.pagina(),
    busqueda: this.busqueda(),
    grupo: this.grupo(),
    recarga: this.recarga()
  }));

  respuesta = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(c =>
        this.bebidasService.buscar(c.pagina, this.tamano, c.busqueda, c.grupo).pipe(
          catchError(err => {
            this.avisos.error(traducirError(err));
            const vacia: Pagina<Bebida> = { content: [], totalElements: 0, totalPages: 0, size: this.tamano, number: 0 };
            return of<Pagina<Bebida> | null>(vacia);
          })
        )
      )
    ),
    { initialValue: null as Pagina<Bebida> | null }
  );

  bebidas = computed(() => this.respuesta()?.content ?? []);
  totalPaginas = computed(() => this.respuesta()?.totalPages ?? 0);
  total = computed(() => this.respuesta()?.totalElements ?? 0);
  esPrimera = computed(() => this.pagina() === 0);
  esUltima = computed(() => this.pagina() >= this.totalPaginas() - 1);

  escribir(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0);
  }

  filtrarGrupo(valor: string): void {
    this.grupo.set(valor as GrupoAlcoholico | '');
    this.pagina.set(0);
  }

  anterior(): void { this.pagina.update(p => p - 1); }
  siguiente(): void { this.pagina.update(p => p + 1); }

  esMia(bebida: Bebida): boolean {
    return this.esVendedor() && bebida.vendedorId === this.miId;
  }

  // Borrado lógico: el backend la marca ELIMINADA y deja de salir en el listado
  retirar(bebida: Bebida): void {
    if (!confirm(`¿Retirar "${bebida.nombre}" del catálogo?`)) return;
    this.bebidasService.eliminar(bebida.id).subscribe({
      next: () => {
        this.avisos.exito(`"${bebida.nombre}" se retiró del catálogo.`);
        this.recarga.update(n => n + 1);
      },
      error: err => this.avisos.error(traducirError(err, 'La bebida'))
    });
  }

  textoGrupo(grupo: GrupoAlcoholico): string {
    return this.grupos.find(g => g.valor === grupo)?.texto ?? grupo;
  }

  colorGrupo(grupo: GrupoAlcoholico): string {
    const colores: Record<GrupoAlcoholico, string> = {
      SIN_ALCOHOL: 'bg-success',
      FERMENTADA: 'bg-warning text-dark',
      DESTILADA: 'bg-danger'
    };
    return colores[grupo];
  }
}