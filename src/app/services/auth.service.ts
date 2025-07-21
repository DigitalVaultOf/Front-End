import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { apigateway } from '../environments/apigateway';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getAccountNumber() {
    throw new Error('Method not implemented.');
  }

  private token: string | null = null;
  private apiUrl = `${apigateway.API_URL}/auth/api/login`;

  private isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  constructor(private http: HttpClient) {
    if (this.isBrowser) {
      this.token = localStorage.getItem('token');
    } else {
      this.token = null;
    }
  }

  login(credentials: {
    accountNumber?: string;
    email?: string;
    cpf?: string;
    password: string;
    selectedAccountNumber?: string;
  }) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        // 🔒 SÓ SALVAR TOKEN SE ELE EXISTIR E NÃO FOR NULL!
        if (this.isBrowser && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          this.token = response.data.token;
        }
        // Se não tem token (múltiplas contas), não faz nada
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

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.token = null;
    }
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = localStorage.getItem('token');
    return !!token && token !== 'null' && token !== 'undefined';
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem('token');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  }
}