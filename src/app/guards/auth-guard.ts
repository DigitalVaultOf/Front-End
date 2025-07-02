import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from 'express';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token')
  if(token){
    return true
  }else{
    return inject(Router).createUrlTree(['/login'])
  }
};
