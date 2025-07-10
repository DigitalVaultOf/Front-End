import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Injeta o platformId para saber onde estamos rodando.
  const platformId = inject(PLATFORM_ID);

  // 2. Só tenta acessar o localStorage se estiver no navegador.
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(cloned);
    }
  }

  // 3. Se não estiver no navegador ou se não houver token,
  // a requisição original continua sem o cabeçalho de autorização.
  return next(req);
};