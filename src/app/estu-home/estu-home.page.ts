import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../api.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-estu-home',
  templateUrl: './estu-home.page.html',
  styleUrls: ['./estu-home.page.scss'],
})
export class EstuHomePage implements OnInit {
  nombre: string = '';
  correo: string = '';
  qrDisponible: boolean = false;
  scanActive: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userData);
      this.nombre = user.nombre;
      this.correo = user.email;

      // Verificación adicional con el backend
      this.apiService.getUsuarios(user.email).subscribe(
        (users) => {
          if (users && users.length > 0) {
            const currentUser = users[0];
            // Actualizar datos por si hubo cambios en el backend
            this.nombre = currentUser.nombre;
            this.correo = currentUser.email;
          }
        },
        (error) => {
          console.error('Error al verificar usuario:', error);
          this.mostrarError('Error al actualizar datos del usuario');
        }
      );
    } catch (error) {
      console.error('Error al procesar datos del usuario:', error);
      this.router.navigate(['/login']);
    }
  }

  async checkPermission() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        return true;
      }
      return false;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  async escanearQR() {
    try {
      const allowed = await this.checkPermission();
      if (!allowed) {
        this.mostrarError('Por favor permite el acceso a la cámara');
        return;
      }
  
      await BarcodeScanner.hideBackground();
      document.querySelector('body')?.classList.add('scanner-active');
      this.scanActive = true;
  
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        await this.processQRData(result.content);
        document.querySelector('body')?.classList.remove('scanner-active');
        this.scanActive = false;
      }
    } catch(e) {
      console.error(e);
      this.mostrarError('Error al escanear el código QR');
      this.stopScan();
    }
  }

  async processQRData(qrContent: string) {
    try {
      const qrData = JSON.parse(qrContent);
      const asistenciaData = {
        correo: this.correo,
        clase: qrData.clase,
        seccion: qrData.seccion
      };

      this.apiService.registrarAsistencia(asistenciaData).subscribe({
        next: (response) => {
          this.mostrarMensaje('Asistencia registrada con éxito');
        },
        error: (error) => {
          this.mostrarError('Error al registrar la asistencia');
        }
      });
    } catch (e) {
      this.mostrarError('QR inválido');
    }
  }

  async stopScan() {
    try {
      await BarcodeScanner.stopScan();
      this.scanActive = false;
      document.querySelector('body')?.classList.remove('scanner-active');
      document.querySelector('ion-content')?.classList.remove('scanner-active');
    } catch (error) {
      console.error('Error al detener el scanner:', error);
      this.mostrarError('Error al detener el scanner');
    }
  }
  
ionViewWillLeave() {
  this.stopScan();
}
  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUserEmail');
    this.router.navigate(['/login']);
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  private async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }
}