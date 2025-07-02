import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Deposito } from './deposito/deposito';
import { App } from './app';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'home', component: Home, children:[{ path: 'deposit', component: Deposito },]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}