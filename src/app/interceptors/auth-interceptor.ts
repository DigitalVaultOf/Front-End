// auth-interceptor.ts - VERSÃO CORRIGIDA
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Adicionar token se existir
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRoute =
        req.url.includes('/auth/api/login') ||
        req.url.includes('/auth/api/register') ||
        req.url.includes('/auth/api/forgot') ||
        req.url.includes('/auth/api/reset');

      // ✅ SÓ TRATAR COMO SESSÃO EXPIRADA SE:
      // 1. Não for rota de autenticação
      // 2. Usuário estava realmente logado (tinha token)
      // 3. Token estava sendo enviado na requisição
      const wasLoggedIn = !!token; // Se tinha token, estava logado
      const shouldTreatAsExpired = (error.status === 401 || error.status === 403) 
        && !isAuthRoute 
        && wasLoggedIn;

      if (shouldTreatAsExpired) {
        console.warn('🚨 Token inválido/expirado detectado pelo backend');
        authService.logoutDueToExpiration();
      } else if ((error.status === 401 || error.status === 403) && isAuthRoute) {
        console.log('🔐 Erro de autenticação em rota de login (normal)');
      }

      return throwError(() => error);
    })
  );
};