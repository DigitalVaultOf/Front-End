import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    // Durante SSR: não acessa localStorage e bloqueia o acesso
    return false; // ou true, se quiser permitir no SSR
  }

  const token = localStorage.getItem('token');
  if (token) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
