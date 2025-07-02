import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Deposito } from './deposito/deposito';
import { App } from './app';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: App},
  { path: 'deposit', component: Deposito },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}