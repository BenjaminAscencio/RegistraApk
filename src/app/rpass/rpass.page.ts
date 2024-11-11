import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rpass',
  templateUrl: './rpass.page.html',
  styleUrls: ['./rpass.page.scss'],
})
export class RpassPage {
  email: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async changePassword() {
    if (!this.email  ||  !this.oldPassword  || !this.newPassword || !this.confirmPassword) {
      this.presentAlert('Error', 'Todos los campos son requeridos');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.presentAlert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      const response = await this.apiService.changePassword(
        this.email,
        this.oldPassword,
        this.newPassword
      ).toPromise();

      await this.presentAlert('Éxito', 'Contraseña actualizada correctamente');
      this.router.navigate(['/login']);
    } catch (error) {
      this.presentAlert('Error', 'No se pudo actualizar la contraseña');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}