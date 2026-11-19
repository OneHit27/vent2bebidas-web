import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BebidasService } from '../../servicios/bebidas';
import { ComprasService } from '../../servicios/compras';
import { NotificacionesService } from '../../servicios/notificaciones';
import { Bebida } from '../../modelos/bebidas';
import { ConfirmarCompraRequest } from '../../modelos/compras';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css'
})
export class Comprar {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bebidasService = inject(BebidasService);
  private comprasService = inject(ComprasService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly maxUnidades = 24; // una compra lleva entre 1 y 24 unidades (regla del dominio)

  bebida = signal<Bebida | null>(null);
  noEncontrada = signal(false);
  isLoading = signal(false);

  // Mismos campos que ConfirmarCompraRequest: bebidaId y unidades
  compraForm = inject(FormBuilder).nonNullable.group({
    bebidaId: ['', Validators.required],
    unidades: [1, [Validators.required, Validators.min(1), Validators.max(this.maxUnidades)]]
  });

  private unidades = toSignal(this.compraForm.controls.unidades.valueChanges, { initialValue: 1 });
  total = computed(() => (this.bebida()?.monto ?? 0) * (this.unidades() ?? 0));

  get unidadesCtrl() { return this.compraForm.controls.unidades; }

  constructor() {
    // El id de la bebida viene en la URL: /comprar/:id
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.compraForm.controls.bebidaId.setValue(id);

    this.bebidasService.obtener(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: bebida => this.bebida.set(bebida),
        error: (err: HttpErrorResponse) => {
          this.noEncontrada.set(true);
          this.avisos.error(traducirError(err, 'La bebida'));
        }
      });
  }

  onSubmit(): void {
    if (this.compraForm.invalid || this.isLoading()) return;
    this.isLoading.set(true); // apaga el botón mientras se envía
    const solicitud: ConfirmarCompraRequest = this.compraForm.getRawValue();

    this.comprasService.comprar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: compra => {
          this.isLoading.set(false);
          this.avisos.exito(
            `¡Compra confirmada! ${compra.unidades} unidad(es) por ${compra.total.toLocaleString('es-CO')} ${compra.moneda}.`
          );
          this.router.navigate(['/catalogo']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          // 400 revisa los datos · 401 inicia sesión · 404 no existe · 422 regla de negocio
          this.avisos.error(traducirError(err, 'La bebida'));
        }
      });
  }
}