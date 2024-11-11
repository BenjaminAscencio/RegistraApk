import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-list-asis',
  templateUrl: './list-asis.page.html',
  styleUrls: ['./list-asis.page.scss'],
})
export class ListAsisPage implements OnInit {
  asistencias: any[] = [];
  filteredAsistencias: any[] = [];
  claseFilter: string = '';
  seccionFilter: string = '';
  clases: string[] = [];
  secciones: string[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadAsistencias();
  }

  loadAsistencias() {
    this.apiService.getAsistencias().subscribe({
      next: (data) => {
        this.asistencias = data;
        this.filteredAsistencias = data;
        this.updateFilters();
      },
      error: (error) => {
        console.error('Error al cargar asistencias:', error);
      }
    });
  }

  updateFilters() {
    this.clases = [...new Set(this.asistencias.map(a => a.clase_nombre))];
    this.secciones = [...new Set(this.asistencias.map(a => a.seccion))];
  }

  applyFilters() {
    this.filteredAsistencias = this.asistencias.filter(asistencia => {
      const matchClase = !this.claseFilter || asistencia.clase_nombre === this.claseFilter;
      const matchSeccion = !this.seccionFilter || asistencia.seccion === this.seccionFilter;
      return matchClase && matchSeccion;
    });
  }

  clearFilters() {
    this.claseFilter = '';
    this.seccionFilter = '';
    this.filteredAsistencias = this.asistencias;
  }

goBack() {
  this.router.navigate(['/profe-home']); // o la ruta que necesites
}

}