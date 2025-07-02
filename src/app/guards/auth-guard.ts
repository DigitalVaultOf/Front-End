import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log('[authGuard] Token:', token);
    if (token) {
      return true;
    } else {
      console.log('[authGuard] Token ausente, redirecionando para /login');
      return router.createUrlTree(['/login']);
    }
  }

  console.log('[authGuard] Ambiente não-browser, redirecionando para /login');
  return router.createUrlTree(['/login']);
};
