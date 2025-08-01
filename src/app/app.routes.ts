import { UserRegistration } from './user-registration/user-registration';
import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Deposito } from './deposito/deposito';
import { App } from './app';
import { Home } from './home/home';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'user-registration', component: UserRegistration },
    { path: 'login', component: Login },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'deposit', component: Deposito, canActivate: [authGuard] },
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}