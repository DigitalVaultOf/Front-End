import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Deposito } from './deposito/deposito';
import { authGuard } from './guards/auth-guard';
import { Home } from './home/home';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path: 'Home', component: Home, canActivate: [authGuard], children: [{ path: 'deposit', component: Deposito, canActivate: [authGuard] },] },
    { path: 'login', component: Login },
]
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }