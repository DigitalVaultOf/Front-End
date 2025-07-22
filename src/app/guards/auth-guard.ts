import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService); // ✅ Injetar AuthService

  if (isPlatformBrowser(platformId)) {
    // ✅ Usar método melhorado que verifica expiração
    if (authService.isLoggedIn()) {
      return true;
    }
  }

  return router.createUrlTree(['/login']);
};