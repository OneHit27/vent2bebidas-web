import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EnvasesService } from '../../servicios/envases';
import { NotificacionesService } from '../../servicios/notificaciones';
import { Envase, EstadoEnvase, RegistrarEnvaseRequest } from '../../modelos/envases';
import { MaterialEnvase } from '../../modelos/bebidas';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-envases',
  imports: [ReactiveFormsModule],
  templateUrl: './envases.html',
  styleUrl: './envases.css'
})
export class Envases {
  private envasesService = inject(EnvasesService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;

  readonly materiales: MaterialEnvase[] = ['VIDRIO', 'PLASTICO', 'ALUMINIO'];

  envase = signal<Envase | null>(null);
  registrando = signal(false);
  procesando = signal(false);

  // Espejo de RegistrarEnvaseRequest.java
  registroForm = this.fb.group({
    material: ['VIDRIO' as MaterialEnvase, Validators.required],
    capacidadMl: [330, [Validators.required, Validators.min(1)]],
    retornable: [true]
  });

  busquedaForm = this.fb.group({
    id: ['', [Validators.required, Validators.pattern(/^[0-9a-fA-F-]{36}$/)]]
  });

  // Porcentaje de la vida útil que ya se usó (vidrio 30 usos, plástico 10)
  vidaUsada = computed(() => {
    const e = this.envase();
    if (!e) return 0;
    const maximo = e.cantidadUsos + e.usosRestantes;
    return maximo === 0 ? 100 : Math.round((e.cantidadUsos * 100) / maximo);
  });

  registrar(): void {
    if (this.registroForm.invalid || this.registrando()) return;
    this.registrando.set(true);
    const solicitud: RegistrarEnvaseRequest = this.registroForm.getRawValue();

    this.envasesService.registrar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: envase => {
          this.registrando.set(false);
          this.envase.set(envase);
          this.busquedaForm.setValue({ id: envase.id });
          this.avisos.exito('Envase registrado. Ya puedes gestionar su ciclo de vida.');
        },
        error: (err: HttpErrorResponse) => {
          this.registrando.set(false);
          this.avisos.error(traducirError(err)); // 422: aluminio retornable
        }
      });
  }

  buscar(): void {
    if (this.busquedaForm.invalid) return;
    this.ejecutar(this.envasesService.obtener(this.busquedaForm.getRawValue().id.trim()), '');
  }

  registrarRetorno(): void {
    this.ejecutar(this.envasesService.registrarRetorno(this.idActual()), 'Retorno registrado: se sumó un uso.');
  }

  marcarDanado(): void {
    this.ejecutar(this.envasesService.marcarDanado(this.idActual()), 'El envase quedó marcado como dañado.');
  }

  descartar(): void {
    if (!confirm('Un envase descartado ya no puede cambiar. ¿Continuar?')) return;
    this.ejecutar(this.envasesService.descartar(this.idActual()), 'El envase fue descartado (borrado lógico).');
  }

  copiarId(): void {
    navigator.clipboard.writeText(this.idActual());
    this.avisos.info('Id del envase copiado.');
  }

  colorEstado(estado: EstadoEnvase): string {
    const colores: Record<EstadoEnvase, string> = {
      NUEVO: 'bg-primary',
      RETORNADO: 'bg-success',
      DANADO: 'bg-warning text-dark',
      DESCARTADO: 'bg-secondary'
    };
    return colores[estado];
  }

  private idActual(): string {
    return this.envase()?.id ?? '';
  }

  // Todas las acciones responden el envase actualizado: lo mostramos y avisamos
  private ejecutar(peticion: Observable<Envase>, mensajeExito: string): void {
    this.procesando.set(true);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: envase => {
        this.procesando.set(false);
        this.envase.set(envase);
        if (mensajeExito) this.avisos.exito(mensajeExito);
      },
      error: (err: HttpErrorResponse) => {
        this.procesando.set(false);
        this.avisos.error(traducirError(err, 'El envase'));
      }
    });
  }
}