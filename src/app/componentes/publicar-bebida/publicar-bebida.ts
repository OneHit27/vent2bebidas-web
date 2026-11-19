import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BebidasService } from '../../servicios/bebidas';
import { NotificacionesService } from '../../servicios/notificaciones';
import { GrupoAlcoholico, MaterialEnvase, RegistrarBebidaRequest } from '../../modelos/bebidas';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-publicar-bebida',
  imports: [ReactiveFormsModule],
  templateUrl: './publicar-bebida.html',
  styleUrl: './publicar-bebida.css'
})
export class PublicarBebida {
  private bebidasService = inject(BebidasService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly materiales: MaterialEnvase[] = ['VIDRIO', 'PLASTICO', 'ALUMINIO'];
  readonly grupos: { valor: GrupoAlcoholico; texto: string }[] = [
    { valor: 'SIN_ALCOHOL', texto: 'Sin alcohol' },
    { valor: 'FERMENTADA', texto: 'Fermentada' },
    { valor: 'DESTILADA', texto: 'Destilada' }
  ];

  isLoading = signal(false);

  // Mismos campos que RegistrarBebidaRequest.java
  bebidaForm = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    material: ['VIDRIO' as MaterialEnvase, Validators.required],
    capacidadMl: [330, [Validators.required, Validators.min(1)]],
    retornable: [true],
    grupoAlcoholico: ['FERMENTADA' as GrupoAlcoholico, Validators.required],
    monto: [0, [Validators.required, Validators.min(1)]],
    moneda: ['COP', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]]
  });

  invalido(campo: string): boolean {
    const control = this.bebidaForm.get(campo);
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.bebidaForm.invalid || this.isLoading()) {
      this.bebidaForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const solicitud: RegistrarBebidaRequest = this.bebidaForm.getRawValue();

    this.bebidasService.registrar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: bebida => {
          this.isLoading.set(false);
          this.avisos.exito(`"${bebida.nombre}" quedó publicada en el catálogo.`);
          this.bebidaForm.reset();
          this.router.navigate(['/catalogo']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          // 422 por ejemplo: "Un envase de ALUMINIO no puede ser retornable."
          this.avisos.error(traducirError(err));
        }
      });
  }
}