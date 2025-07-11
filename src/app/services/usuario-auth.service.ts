import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioAuthService {
  private apiUrl = 'https://localhost:7241/api/Auth'; // Ajusta la URL base
  private tokenKey = 'authToken'; // Mejor nombre para evitar conflictos

  constructor(private http: HttpClient, private router: Router) {}

  // Método de login actualizado
  login(username: string, password: string): Observable<{ token: string, username: string, role: string }> {
    return this.http.post<{ token: string, username: string, role: string }>(
      `${this.apiUrl}/login`, 
      { Username: username, Password: password } // Ajuste a mayúsculas para coincidir con el LoginModel de la API
    ).pipe(
      tap(response => {
        this.saveToken(response.token);
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Verifica si el token ha expirado
  private isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);
    return expirationDate.valueOf() < new Date().valueOf();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        // Cambia esta línea para leer el claim correcto
        return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
               decoded['role'] || // Por si acaso
               null;
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
}
  // En usuario-auth.service.ts
 getMappedUserType(): 'funcionario' | 'ciudadano' | null {
    const role = this.getUserRole();
    console.log('Rol obtenido del token:', role); // Para depuración
    return role === 'Admin' ? 'funcionario' : 
           role === 'User' ? 'ciudadano' : null;
}

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded['username'] || null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Nuevo: Obtener el ID del usuario
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded['id'] || null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }
}