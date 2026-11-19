import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { LoginRequest } from '../../modelos/auth';
import { traducirError } from '../../utilidades/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Los nombres de los campos son los del LoginRequest del backend: email y password
  loginForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = signal(false);
  errorLogin = signal('');

  private estado = toSignal(this.loginForm.statusChanges, { initialValue: this.loginForm.status });
  canSubmit = computed(() => this.estado() === 'VALID' && !this.isLoading());

  // Atajos para el HTML
  get email() { return this.loginForm.controls.email; }
  get password() { return this.loginForm.controls.password; }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.isLoading.set(true);
    this.errorLogin.set('');
    const credenciales: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(credenciales)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.authService.guardarSesion(respuesta);
          this.avisos.exito(`Bienvenido, ${respuesta.email}`);
          this.router.navigate(['/catalogo']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorLogin.set(err.status === 401
            ? 'Correo o contraseña incorrectos.'
            : traducirError(err));
        }
      });
  }
}