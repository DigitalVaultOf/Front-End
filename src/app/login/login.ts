import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  loginInput = '';
  password = '';
  loggedIn = false;
  showAccountSelection = false;
  accountOptions: string[] = [];
  selectedAccount: string = '';

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    const trimmedInput = this.loginInput.trim();
    const payload: any = { password: this.password };

    if (trimmedInput.includes('@')) {
      payload.email = trimmedInput;
      this.getAccountsByEmail(payload.email);
    } else if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(trimmedInput)) {
      this.getAccountsByCpf(trimmedInput);
    } else {
      payload.accountNumber = trimmedInput;
      this.auth.login(payload).subscribe({
        next: () => {
          this.loggedIn = true;
          this.router.navigate(['/home']);
        },
        error: (err) => alert(err.message || 'Erro no login.'),
      });
    }
  }

  getAccountsByEmail(email: string) {
    this.http
      .get<any>(`https://localhost:7178/user/api/User/GetAccountByEmail/${email}`)
      .subscribe({
        next: (res) => {
          this.accountOptions = res.data?.accountNumbers || [];
          if (this.accountOptions.length > 1) {
            this.showAccountSelection = true;
          } else if (this.accountOptions.length === 1) {
            this.selectAccount(this.accountOptions[0]);
          } else {
            alert('Nenhuma conta encontrada.');
          }
        },
        error: (err) => alert('Erro ao buscar contas.'),
      });
  }

  getAccountsByCpf(cpfFormatted: string) {
    this.http
      .get<any>(`https://localhost:7178/user/api/User/GetAccountByCpf/${cpfFormatted}`)
      .subscribe({
        next: (res) => {
          this.accountOptions = res.data?.accountNumbers || [];
          if (this.accountOptions.length > 1) {
            this.showAccountSelection = true;
          } else if (this.accountOptions.length === 1) {
            this.selectAccount(this.accountOptions[0]);
          } else {
            alert('Nenhuma conta encontrada.');
          }
        },
        error: (err) => alert('Erro ao buscar contas.'),
      });
  }

  selectAccount(account: string) {
    this.selectedAccount = account;

    const payload: any = {
      password: this.password,
      selectedAccountNumber: account,
    };

    const trimmedInput = this.loginInput.trim();
    if (trimmedInput.includes('@')) {
      payload.email = trimmedInput;
    } else if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(trimmedInput)) {
      payload.cpf = trimmedInput;
    }

    this.auth.login(payload).subscribe({
      next: () => {
        this.loggedIn = true;
        this.router.navigate(['/home']);
      },
      error: (err) => alert(err.message || 'Erro ao selecionar a conta.'),
    });
  }

  logout() {
    this.loggedIn = false;
    this.showAccountSelection = false;
    this.loginInput = '';
    this.password = '';
  }
}