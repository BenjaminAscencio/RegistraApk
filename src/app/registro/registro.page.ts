import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../api.service';

interface RegistroError {
  error?: {
    message?: string;
  };
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;
  roles: string[] = ['alumno', 'profesor'];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['alumno', Validators.required]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.registroForm.valid) {
      this.isLoading = true;
      try {
        const response = await this.apiService.register(this.registroForm.value).toPromise();
        await this.presentAlert('Éxito', 'Usuario registrado correctamente');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error en registro:', error);
        const err = error as RegistroError;
        await this.presentAlert('Error', err.error?.message || 'Error al registrar usuario');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.registroForm);
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
      buttons: ['OK']
    });
    await alert.present();
  }

  getErrorMessage(controlName: string): string {
    const control = this.registroForm.get(controlName);
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'El campo es requerido';
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
    }
    return '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}


