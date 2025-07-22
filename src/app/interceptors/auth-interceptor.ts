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
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ Capturar erros de token expirado/inválido
      if (error.status === 401 || error.status === 403) {
        console.log('🚨 Token inválido/expirado detectado pelo backend');
        authService.logoutDueToExpiration();
        return throwError(() => error);
      }
      
      return throwError(() => error);
    })
  );
};