import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../Shared/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ToastModule, MessageModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private router:Router,
  ) 
    {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { 
    if(this.authService.isLoggedIn()){
      this.router.navigateByUrl('dashboard');
    }
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
    this.authService.loginUser(this.form.value).pipe(
      finalize(() => this.isSubmitted = false)
    ).subscribe({
      next: (res: any) => {
          this.authService.saveToken(res.token);
          this.router.navigateByUrl('dashboard');
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Inicio de sesión exitoso'
          });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al iniciar sesión'
        });
      }
    });
  } 

  onLogout(){
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login')
  }

  hasDisplayError(controlName: string): Boolean{
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }

}
