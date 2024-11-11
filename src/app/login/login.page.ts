import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../api.service';

interface ApiError {
  error: {
    message: string;
  };
  status?: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Limpiar datos de sesión anteriores al iniciar
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUserEmail');
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      try {
        const response = await this.apiService.login(this.loginForm.value).toPromise();
        console.log('Respuesta del servidor:', response);
        
        if (response && response.user && response.user.rol) {
          // Guardar datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(response.user));
          localStorage.setItem('currentUserEmail', response.user.email);

          // Navegar según el rol del usuario
          if (response.user.rol === 'alumno') {
            this.router.navigate(['/estu-home']);
          } else if (response.user.rol === 'profesor') {
            this.router.navigate(['/profe-home']);
          }

          await this.presentAlert('Éxito', `Bienvenido ${response.user.nombre}`);
        } else {
          throw new Error('Respuesta del servidor inválida');
        }
      } catch (error) {
        console.error('Error en login:', error);
        let errorMessage = 'Credenciales inválidas';
        
        if ((error as ApiError).error?.message) {
          errorMessage = (error as ApiError).error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Limpiar cualquier dato de sesión en caso de error
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUserEmail');
        
        await this.presentAlert('Error', errorMessage);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: header.toLowerCase() === 'error' ? 'alert-error' : 'alert-success'
    });
    await alert.present();
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'El campo es requerido';
      if (control.errors['email']) return 'Email inválido';
    }
    return '';
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  goToRpass() {
    this.router.navigate(['/rpass']);
  }
}