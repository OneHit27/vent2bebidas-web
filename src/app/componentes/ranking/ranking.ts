import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { ReportesService } from '../../servicios/reportes';
import { NotificacionesService } from '../../servicios/notificaciones';
import { BebidaVendida } from '../../modelos/reportes';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-ranking',
  imports: [],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class Ranking {
  private reportesService = inject(ReportesService);
  private avisos = inject(NotificacionesService);

  readonly opciones = [3, 5, 10];
  limite = signal(5);

  // Cada vez que cambia el límite se vuelve a pedir el ranking al backend
  ranking = toSignal(
    toObservable(this.limite).pipe(
      switchMap(limite =>
        this.reportesService.masVendidas(limite).pipe(
          catchError(err => {
            this.avisos.error(traducirError(err));
            return of<BebidaVendida[] | null>([]);
          })
        )
      )
    ),
    { initialValue: null as BebidaVendida[] | null }
  );

  filas = computed(() => this.ranking() ?? []);
  private maximo = computed(() => Math.max(1, ...this.filas().map(f => f.unidadesVendidas)));

  porcentaje(fila: BebidaVendida): number {
    return Math.round((fila.unidadesVendidas * 100) / this.maximo());
  }

  cambiarLimite(valor: string): void {
    this.limite.set(Number(valor));
  }
}