import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { FirstKeyPipe } from '../../Shared/pipes/first-key.pipe';
import { AuthService } from '../../Shared/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule, CommonModule, FirstKeyPipe, ToastModule, MessageModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [MessageService]
})
export class RegistrationComponent {
  form: FormGroup;
  isSubmitted:boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.form = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
      ]],
      confirmPassword: [''],
    }, { validators: this.passwordMatch });  
  }
  
  onSubmit() {
    this.isSubmitted = true;
    if (!this.form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: 'Corrige los errores antes de enviar'
      });
      return;
    }
  
    this.authService.createUser(this.form.value)
      .pipe(
        finalize(() => this.isSubmitted = false)
      )
      .subscribe({
        next: (res: any) => {
          if (res.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado correctamente'
            });
            this.form.reset();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el usuario'
            });
          }
        },
        error: (err) => {
          if (err.error?.errors) {
            err.error.errors.forEach((error: any) => this.handleErrorCode(error));
          } else {
            console.error('Error inesperado:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrió un error inesperado, contacte a soporte'
            });
          }
        }
      });
  }

  passwordMatch: ValidatorFn = (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      control.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }
  
  hasDisplayError(controlName: string): Boolean{
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }

  private handleErrorCode(error: any): void {
    switch (error.code) {
      case 'DuplicateEmail':
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ya existe un usuario registrado con ese correo'
        });
        break;
      case 'DuplicateUserName':
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ya existe un usuario registrado con ese nombre de usuario'
        });
        break;
      default:
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al registrarse, contacte a soporte'
        });
        break;
    }
  }
}
