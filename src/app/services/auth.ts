import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  getAccountNumber() {
    throw new Error('Method not implemented.');
  }

  private token: string | null = null;
  private apiUrl = 'https://localhost:7178/auth/api/Auth/login';

  private isBrowser = typeof window !== 'undefined' && !!window.localStorage;

  constructor(private http: HttpClient) {
    if (this.isBrowser) {
      this.token = localStorage.getItem('token');
    } else {
      this.token = null;
    }
  }

  login(accountNumber: string, password: string) {
    return this.http.post<any>(this.apiUrl, {
      accountNumber,
      password,
    }).pipe(
      tap(response => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.data.token);
          this.token = response.data.token;
        }
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
