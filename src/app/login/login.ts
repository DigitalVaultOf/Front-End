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
  loginInput = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router
  ){}

  login() {
    const trimmed = this.loginInput.trim();
    const payload: any = { password: this.password };
  
    if (trimmed.includes('@')) {
      payload.email = trimmed;
    } else if (/^\d{11}$/.test(trimmed.replace(/\D/g, ''))) {
      payload.cpf = trimmed.replace(/\D/g, '');
    } else {
      payload.accountNumber = trimmed;
    }
  
    this.auth.login(payload).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => alert(err.message || 'Ocorreu um erro ao fazer login.'),
    });
  }
}
