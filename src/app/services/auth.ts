import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://localhost:7178/auth/api/Auth/login';

  constructor(private http: HttpClient) {}

  login(accountNumber: string, password: string) {
    console.log('🔐 Iniciando login com conta:', accountNumber);

    return this.http.post<any>(this.apiUrl, {
      accountNumber,
      password,
    }).pipe(
      tap({
        next: response => {
          console.log('✅ Resposta da API recebida:', response);

          const token = response?.data?.token;
          if (token) {
            localStorage.setItem('token', token);
            console.log('💾 Token salvo no localStorage:', token);
          } else {
            console.warn('⚠️ Nenhum token retornado da API:', response);
          }
        },
        error: err => {
          console.error('❌ Erro ao fazer login na API:', err);
        }
      })
    );
  }

  logout(): void {
    console.log('🚪 Logout efetuado. Token removido.');
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    const isLogged = !!localStorage.getItem('token');
    console.log('🔍 Verificando se está logado:', isLogged);
    return isLogged;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('📦 Token obtido do localStorage:', token);
    return token;
  }
}
