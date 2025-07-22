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
        req.url.includes('/auth/api/forgot') || // caso tenha
        req.url.includes('/auth/api/reset');    // caso tenha

      // ✅ Só trata como sessão expirada se não for rota pública
      if ((error.status === 401 || error.status === 403) && !isAuthRoute) {
        console.warn('🚨 Token inválido/expirado detectado pelo backend');
        authService.logoutDueToExpiration(); // já redireciona e alerta
      }

      return throwError(() => error);
    })
  );
};
