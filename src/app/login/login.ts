import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  accountNumber = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  login() {
    this.auth.login(this.accountNumber, this.password).subscribe({
      next: () => {
        // Se login OK, redireciona para home (rota protegida)
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert('Credenciais inválidas');
        console.error('Erro no login:', err);
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
