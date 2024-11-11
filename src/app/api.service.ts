import { Injectable } from '@angular/core';
  import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
  import { Observable, throwError } from 'rxjs';
  import { catchError, tap } from 'rxjs/operators';
  
  @Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    private baseUrl = 'http://192.168.130.71/mi_proyecto/api';
  
    constructor(private http: HttpClient) {}
  
    // Usuarios
    getUsuarios(email?: string): Observable<any[]> {
      let params = new HttpParams();
      if (email) {
        params = params.set('email', email);
      }
      return this.http.get<any[]>(`${this.baseUrl}/usuarios.php`, { params }).pipe(
        catchError(this.handleError)
      );
    }
  
    register(userData: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/usuarios.php`, userData).pipe(
        catchError(this.handleError)
      );
    }
  
    login(credentials: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/usuarios.php`, { ...credentials, action: 'login' }).pipe(
        catchError(this.handleError)
      );
    }
    
  
    updateUser(email: string, userData: any): Observable<any> {
      return this.http.put(`${this.baseUrl}/usuarios.php/${email}`, userData).pipe(
        catchError(this.handleError)
      );
    }
    changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
      return this.http.patch(`${this.baseUrl}/usuarios.php`, {
        email,
        oldPassword,
        newPassword
      }).pipe(
        catchError(this.handleError)
      );
    }
  

    
  
    // Asistencias
    getAsistencias(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/asistencias.php`).pipe(
        catchError(this.handleError)
      );
    }
  
    registrarAsistencia(asistenciaData: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/asistencias.php`, asistenciaData).pipe(
        catchError(this.handleError)
      );
    }
  
    clearAsistencias(): Observable<any> {
      return this.http.delete(`${this.baseUrl}/asistencias.php/clear-asistencias`).pipe(
        catchError(this.handleError)
      );
    }
  
    // Clases
    getClases(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/clases.php`).pipe(
        catchError(this.handleError)
      );
    }
  
    private handleError(error: HttpErrorResponse) {
      console.error('Error completo:', error);
      
      if (error.error instanceof ErrorEvent) {
        console.error('Error del cliente:', error.error.message);
      } else {
        console.error(
          `Código de error del backend: ${error.status}, ` +
          `mensaje: ${error.error}`);
      }
      
      return throwError(() => 'Algo falló. Por favor, inténtalo de nuevo más tarde.');
    }
  }