import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { apigateway } from '../environments/apigateway';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private apiUrl = `${apigateway.API_URL}/auth/api/login`;
  private isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private alertService: AlertService
  ) {
    if (this.isBrowser) {
      this.token = localStorage.getItem('token');
    }
  }

  login(credentials: any) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        if (this.isBrowser && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          this.token = response.data.token;
        }
      }),
      catchError((err) => {
        let errorMessage = 'Ocorreu um erro desconhecido.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // ✅ NOVO: Decodificar JWT
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // ✅ NOVO: Verificar se token está expirado
  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const expiration = decoded.exp * 1000; // JWT exp é em segundos
    const now = Date.now();
    
    return now >= expiration;
  }

  // ✅ MODIFICADO: Verificar se está logado E se token é válido
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    
    const token = localStorage.getItem('token');
    
    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }

    // ✅ Verificar se token está expirado
    if (this.isTokenExpired(token)) {
      this.handleExpiredToken();
      return false;
    }

    return true;
  }

  // ✅ NOVO: Tratar token expirado
  private handleExpiredToken(): void {
    this.logout();
    this.alertService.showWarning(
      'Sessão Expirada',
      'Sua sessão expirou. Por favor, faça login novamente.'
    );
    this.router.navigate(['/login']);
  }

  // ✅ NOVO: Logout com redirecionamento quando token expira
  logoutDueToExpiration(): void {
    this.logout();
    this.alertService.showWarning(
      'Sessão Expirada',
      'Sua sessão expirou. Por favor, faça login novamente.'
    );
    this.router.navigate(['/login']);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.token = null;
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem('token');
    
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }

    // ✅ Verificar expiração ao pegar token
    if (this.isTokenExpired(token)) {
      this.handleExpiredToken();
      return null;
    }

    return token;
  }

  // ✅ NOVO: Verificar se token expira em breve (5 minutos)
  isTokenExpiringSoon(): boolean {
    if (!this.isBrowser) return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiration = decoded.exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return (expiration - now) <= fiveMinutes;
  }

  getAccountNumber() {
    throw new Error('Method not implemented.');
  }
}