import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
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
    private auth: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatInput(event: any) {
    const value = event.target.value;
    if (value.includes('@') || /[a-zA-Z]/.test(value)) {
      this.loginInput = value;
      return;
    }
    const numbersOnly = value.replace(/\D/g, '');

    if (numbersOnly.length === 11) {
      event.target.value = this.formatCpf(numbersOnly);
      this.loginInput = event.target.value;
    } else if (numbersOnly.length <= 11) {
      event.target.value = numbersOnly;
      this.loginInput = event.target.value;
    } else {
      const cpfLimit = numbersOnly.substring(0, 11);
      event.target.value = this.formatCpf(cpfLimit);
      this.loginInput = event.target.value;
    }
  }

  login() {
    const trimmedInput = this.loginInput.trim();
    const trimmedPassword = this.password.trim();

    // Validações
    if (!trimmedInput) {
      this.alertService.showWarning(
        'Campo obrigatório',
        'Por favor, informe o número da conta, CPF ou e-mail.'
      );
      return;
    }

    if (!trimmedPassword) {
      this.alertService.showWarning(
        'Campo obrigatório',
        'Por favor, informe sua senha.'
      );
      return;
    }

    const payload: any = { password: trimmedPassword };

    // Detectar tipo de entrada
    if (trimmedInput.includes('@')) {
      payload.email = trimmedInput;
    } else if (trimmedInput.replace(/\D/g, '').length === 11) {
      payload.cpf = trimmedInput.replace(/\D/g, '');
    } else {
      payload.accountNumber = trimmedInput;
    }

    // Fazer login
    this.auth.login(payload).subscribe({
      next: (response: any) => {
        if (
          !response.data.token &&
          response.data.accountNumbers &&
          response.data.accountNumbers.length > 0
        ) {
          // Múltiplas contas - mostrar seleção
          this.accountOptions = response.data.accountNumbers;
          this.showAccountSelection = true;
          this.cdr.detectChanges();
        } else {
          // Login direto com sucesso
          this.loggedIn = true;
          this.alertService.showSuccess(
            'Sucesso!',
            'Login realizado com sucesso!'
          );
          this.cdr.detectChanges();
          this.router.navigate(['/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.error && err.error.data && err.error.data.accountNumbers) {
          // Erro que contém múltiplas contas
          this.accountOptions = err.error.data.accountNumbers;
          this.showAccountSelection = true;
          this.cdr.detectChanges();
        } else {
          this.alertService.showError(
            'Ops! Algo deu errado...',
            err.error?.message ||
              err.message ||
              'Algo deu errado ao realizar login.'
          );
        }
      },
    });
  }

  selectAccount(account: string) {
    this.selectedAccount = account;

    if (!this.password.trim()) {
      this.alertService.showError(
        'Erro',
        'Sessão expirada. Faça login novamente.'
      );
      this.logout();
      return;
    }

    const payload: any = {
      password: this.password.trim(),
      selectedAccountNumber: account,
    };

    const trimmedInput = this.loginInput.trim();
    if (trimmedInput.includes('@')) {
      payload.email = trimmedInput;
    } else if (trimmedInput.replace(/\D/g, '').length === 11) {
      payload.cpf = trimmedInput.replace(/\D/g, '');
    }

    this.auth.login(payload).subscribe({
      next: () => {
        this.loggedIn = true;
        this.alertService.showSuccess(
          'Sucesso!',
          'Login realizado com sucesso!'
        );
        this.cdr.detectChanges();
        this.router.navigate(['/home']);
      },
      error: (err) =>
        this.alertService.showError(
          'Ops! Algo deu errado...',
          err.error?.message || err.message || 'Erro ao selecionar a conta.'
        ),
    });
  }

  logout() {
    this.loggedIn = false;
    this.showAccountSelection = false;
    this.loginInput = '';
    this.password = '';
    this.cdr.detectChanges();
  }
}