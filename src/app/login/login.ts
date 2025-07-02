import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
    goTo(path: string) {
    this.router.navigate([path]);
  }
  accountNumber = '';
  password = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ){}

  login() {
    this.http
      .post<any>('https://localhost:7178/auth/api/Auth/login', {
        accountNumber: this.accountNumber,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.login(res.data.token);
          this.router.navigate(['/']);
        },
        error: () => alert('Falha no login.'),
      });
  }
}
