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
  accountNumber = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router
  ){}

  login() {
    this.auth.login(this.accountNumber, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Credenciais inválidas'),
    });
  }
}
