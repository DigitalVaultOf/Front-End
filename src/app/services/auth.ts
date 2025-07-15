import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  getAccountNumber() {
    throw new Error('Method not implemented.');
  }

  private token: string | null = null;
  private apiUrl = `${environment.API_URL}/auth/api/login`;

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
  }) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        if (this.isBrowser) {
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

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.token = null;
    }
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }
}
