import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../services/alert.service';
import { UserService } from '../services/user.service';

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
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService
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
        error: (err) =>
          this.alertService.showError(
            'Ops! Algo deu errado...',
            err.message || 'Algo deu errado ao realizar login.'
          ),
      });
    }
  }

  getAccountsByEmail(email: string) {
    this.http
      .get<any>(
        `https://localhost:7178/user/api/User/GetAccountByEmail/${email}`
      )
      .subscribe({
        next: (res) => {
          this.accountOptions = res.data?.accountNumbers || [];
          if (this.accountOptions.length > 0) {
            this.validatePasswordAndProceed(
              email,
              null,
              this.accountOptions[0]
            );
          } else {
            this.alertService.showError(
              'Ops! Algo deu errado...',
              'Não foi possível encontrar contas associadas a este e-mail.'
            );
          }
        },
        error: (err) =>
          this.alertService.showError(
            'Ops! Algo deu errado...',
            err.message || 'Erro ao buscar contas.'
          ),
      });
  }

  getAccountsByCpf(cpfFormatted: string) {
    this.http
      .get<any>(
        `https://localhost:7178/user/api/User/GetAccountByCpf/${cpfFormatted}`
      )
      .subscribe({
        next: (res) => {
          this.accountOptions = res.data?.accountNumbers || [];
          if (this.accountOptions.length > 0) {
            this.validatePasswordAndProceed(
              null,
              cpfFormatted,
              this.accountOptions[0]
            );
          } else {
            this.alertService.showError(
              'Ops! Algo deu errado...',
              'Nenhuma conta encontrada para este CPF.'
            );
          }
        },
        error: (err) =>
          this.alertService.showError(
            'Ops! Algo deu errado...',
            err.message || 'Erro ao buscar contas.'
          ),
      });
  }

  private validatePasswordAndProceed(
    email: string | null,
    cpf: string | null,
    accountToTest: string
  ) {
    const payload: any = {
      password: this.password,
      selectedAccountNumber: accountToTest,
    };

    if (email) {
      payload.email = email;
    } else if (cpf) {
      payload.cpf = cpf;
    }

    this.auth.login(payload).subscribe({
      next: () => {
        if (this.accountOptions.length > 1) {
          this.showAccountSelection = true;
        } else {
          this.selectAccount(this.accountOptions[0]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.alertService.showError('Ops! Algo deu errado...', err.message);
        console.error('Erro de autenticação:', err);
      },
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
        this.alertService.showSuccess(
          'Sucesso!',
          'Login realizado com sucesso!'
        );
        this.router.navigate(['/home']);
      },
      error: (err) =>
        this.alertService.showError(
          'Ops! Algo deu errado...',
          err.message || 'Erro ao selecionar a conta.'
        ),
    });
  }

  logout() {
    this.loggedIn = false;
    this.showAccountSelection = false;
    this.loginInput = '';
    this.password = '';
  }
}
