import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://localhost:7178/auth/api/Auth/login';

  constructor(private http: HttpClient){}

  login(accountNumber: string, password: string) {
    return this.http.post<any>(this.apiUrl, {
      accountNumber,
      password,
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.data.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
