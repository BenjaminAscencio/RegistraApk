import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { ApiService } from '../api.service';

interface Clase {
  id: number;
  nombre: string;
  seccion: string;
}

interface Asistencia {
  id: number;
  usuario_id: number;
  clase_id: number;
  seccion: string;
  fecha_hora: string;
}

@Component({
  selector: 'app-profe-home',
  templateUrl: './profe-home.page.html',
  styleUrls: ['./profe-home.page.scss'],
})
export class ProfeHomePage implements OnInit {
  nombre: string = '';
  correo: string = '';
  claseSeleccionada: string = '';
  seccionSeleccionada: string = '';
  qrData: string = '';
  clases: Clase[] = [];
  asistencias: Asistencia[] = [];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.cargarClases();
    this.cargarAsistencias();
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

      this.apiService.getUsuarios(user.email).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            const currentUser = users[0];
            this.nombre = currentUser.nombre;
            this.correo = currentUser.email;
          }
        },
        error: (error) => {
          console.error('Error al verificar usuario:', error);
          this.mostrarError('Error al actualizar datos del usuario');
        }
      });
    } catch (error) {
      console.error('Error al procesar datos del usuario:', error);
      this.router.navigate(['/login']);
    }
  }

  cargarClases() {
    this.apiService.getClases().subscribe({
      next: (clases) => {
        this.clases = clases;
      },
      error: (error) => {
        console.error('Error al cargar clases:', error);
        this.mostrarError('Error al cargar las clases');
      }
    });
  }

  cargarAsistencias() {
    this.apiService.getAsistencias().subscribe({
      next: (asistencias) => {
        this.asistencias = asistencias;
      },
      error: (error) => {
        console.error('Error al cargar asistencias:', error);
        this.mostrarError('Error al cargar las asistencias');
      }
    });
  }

  async seleccionarClaseYSeccion() {
    const nombresClases = [...new Set(this.clases.map(clase => clase.nombre))];
    
    const alertClase = await this.alertController.create({
      header: 'Seleccionar Clase',
      inputs: nombresClases.map(nombre => ({
        name: 'clase',
        type: 'radio',
        label: nombre,
        value: nombre,
        checked: nombre === this.claseSeleccionada
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Siguiente',
          handler: (data) => {
            if (data) {
              this.claseSeleccionada = data;
              this.mostrarSeleccionSeccion(data);
            }
          }
        }
      ]
    });

    await alertClase.present();
  }

  async mostrarSeleccionSeccion(nombreClase: string) {
    const secciones = [...new Set(
      this.clases
        .filter(clase => clase.nombre === nombreClase)
        .map(clase => clase.seccion)
    )];

    const alertSeccion = await this.alertController.create({
      header: 'Seleccionar Sección',
      inputs: secciones.map(seccion => ({
        name: 'seccion',
        type: 'radio',
        label: seccion,
        value: seccion,
        checked: seccion === this.seccionSeleccionada
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data) {
              this.seccionSeleccionada = data;
              this.generarQR();
            }
          }
        }
      ]
    });

    await alertSeccion.present();
  }

  generarQR() {
    const claseSeleccionada = this.clases.find(
      clase => clase.nombre === this.claseSeleccionada && 
               clase.seccion === this.seccionSeleccionada
    );

    if (claseSeleccionada) {
      const qrInfo = {
        claseId: claseSeleccionada.id,
        clase: claseSeleccionada.nombre,
        seccion: claseSeleccionada.seccion,
        profesorId: JSON.parse(localStorage.getItem('userData') || '{}').id,
        timestamp: new Date().toISOString()
      };
      
      this.qrData = JSON.stringify(qrInfo);
      this.mostrarMensaje('Código QR generado correctamente');
    } else {
      this.mostrarError('Error al generar el código QR');
    }
  }

  goTolist() {
    this.router.navigate(['/list-asis']);
  }

  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUserEmail');
    this.router.navigate(['/login']);
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

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}