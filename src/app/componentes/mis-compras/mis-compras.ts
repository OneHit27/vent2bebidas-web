import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComprasService } from '../../servicios/compras';
import { ConsumidoresService } from '../../servicios/consumidores';
import { BebidasService } from '../../servicios/bebidas';
import { NotificacionesService } from '../../servicios/notificaciones';
import { Compra } from '../../modelos/compras';
import { Consumidor } from '../../modelos/consumidores';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-mis-compras',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css'
})
export class MisCompras {
  private comprasService = inject(ComprasService);
  private consumidoresService = inject(ConsumidoresService);
  private bebidasService = inject(BebidasService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  perfil = signal<Consumidor | null>(null);
  compras = signal<Compra[] | null>(null);
  nombres = signal<Record<string, string>>({});
  cancelando = signal<string | null>(null);

  lista = computed(() => this.compras() ?? []);

  constructor() {
    this.cargarPerfil();
    this.cargarCompras();
  }

  private cargarPerfil(): void {
    this.consumidoresService.miPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: perfil => this.perfil.set(perfil),
        error: (err: HttpErrorResponse) => this.avisos.error(traducirError(err, 'El perfil'))
      });
  }

  private cargarCompras(): void {
    this.comprasService.mias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: compras => {
          this.compras.set(compras);
          this.cargarNombres(compras);
        },
        error: (err: HttpErrorResponse) => {
          this.compras.set([]);
          this.avisos.error(traducirError(err));
        }
      });
  }

  // CompraResponse solo trae el id de la bebida: pedimos el nombre una vez por cada bebida distinta
  private cargarNombres(compras: Compra[]): void {
    const ids = [...new Set(compras.map(c => c.bebidaId))];
    for (const id of ids) {
      this.bebidasService.obtener(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: bebida => this.nombres.update(n => ({ ...n, [id]: bebida.nombre })),
          error: () => this.nombres.update(n => ({ ...n, [id]: 'Bebida retirada' }))
        });
    }
  }

  nombreDe(bebidaId: string): string {
    return this.nombres()[bebidaId] ?? 'Cargando...';
  }

  cancelar(compra: Compra): void {
    if (!confirm('¿Seguro que quieres cancelar esta compra?')) return;
    this.cancelando.set(compra.id);

    this.comprasService.cancelar(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: actualizada => {
          this.cancelando.set(null);
          this.compras.update(lista => (lista ?? []).map(c => c.id === actualizada.id ? actualizada : c));
          this.avisos.exito('La compra quedó cancelada.');
        },
        error: (err: HttpErrorResponse) => {
          this.cancelando.set(null);
          // 422 si pasaron más de 24 horas o ya estaba cancelada
          this.avisos.error(traducirError(err, 'La compra'));
        }
      });
  }
}