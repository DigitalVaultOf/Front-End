import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../services/alert.service';
import { UserService } from '../services/user.service';
import {
  faUser,
  faSignInAlt,
  faIdCard,
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
  faQuestionCircle,
  faUserPlus,
  faShieldAlt,
  faUsers,
  faListUl,
  faCreditCard,
  faChevronRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
    showPassword = false;

    faUser = faUser;
  faSignInAlt = faSignInAlt;
  faIdCard = faIdCard;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  faQuestionCircle = faQuestionCircle;
  faUserPlus = faUserPlus;
  faShieldAlt = faShieldAlt;
  faUsers = faUsers;
  faListUl = faListUl;
  faCreditCard = faCreditCard;
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  loginInput = '';
  password = '';
  loggedIn = false;
  showAccountSelection = false;
  accountOptions: string[] = [];
  selectedAccount: string = '';
  isLoading = false;
  private isSubmitting = false;

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
    trackByAccount(index: number, account: string): string {
    return account;
  }

  getAccountType(index: number): string {
  return index % 2 === 0 ? 'Conta Corrente' : 'Conta Poupança';
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
    if (this.isLoading || this.isSubmitting) return;

    const trimmedInput = this.loginInput.trim();
    const trimmedPassword = this.password.trim();

    // Validações iniciais
     if (!trimmedInput || !trimmedPassword) {
    // ✅ PREVENIR SPAM DE ALERTS
    this.isSubmitting = true;
    
    this.alertService.showWarning(
      'Campo(s) obrigatório(s)!',
      !trimmedInput
        ? 'Por favor, informe o número da conta, CPF ou e-mail.'
        : 'Por favor, informe sua senha.'
    );
    
    // ✅ RESETAR APÓS 2 SEGUNDOS
    setTimeout(() => {
      this.isSubmitting = false;
    }, 2000);
    
    return;
  }

    this.isLoading = true;
    console.log('⏱️ Login iniciado:', new Date().toISOString());
    const startTime = Date.now();

    const payload: any = { password: trimmedPassword };

    // Detectar tipo de entrada e configurar payload
    if (trimmedInput.includes('@')) {
      payload.email = trimmedInput;
    } else if (trimmedInput.replace(/\D/g, '').length === 11) {
      payload.cpf = trimmedInput.replace(/\D/g, '');
    } else {
      payload.accountNumber = trimmedInput;
    }

    // Timer para garantir máximo de 3 segundos
    const maxTimeout = setTimeout(() => {
      console.log(
        '⚠️ Timeout máximo atingido:',
        (Date.now() - startTime) / 1000,
        'segundos'
      );
      this.isLoading = false;
      this.alertService.showError(
        'Ops! Algo deu errado...',
        'Tempo limite de conexão excedido. Tente novamente.'
      );
      this.cdr.detectChanges();
    }, 3000);

    const minDelay = 1000; // 1 segundo; // Delay mínimo de 1 segundo

    this.auth.login(payload).subscribe({
      next: (response: any) => {
        const elapsedTime = Date.now() - startTime;
        console.log(
          '✅ Login bem sucedido em:',
          elapsedTime / 1000,
          'segundos'
        );

        const remainingDelay = Math.max(0, minDelay - elapsedTime);
        console.log('⏳ Delay adicional:', remainingDelay / 1000, 'segundos');

        setTimeout(() => {
          clearTimeout(maxTimeout);

          if (
            !response.data.token &&
            response.data.accountNumbers?.length > 0
          ) {
            this.accountOptions = response.data.accountNumbers;
            this.showAccountSelection = true;
          } else {
            this.loggedIn = true;
            this.alertService.showSuccess(
              'Sucesso!',
              'Login realizado com sucesso!'
            );
            this.router.navigate(['/home']);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }, remainingDelay);
      },
      error: (err: HttpErrorResponse) => {
        const elapsedTime = Date.now() - startTime;
        console.log('❌ Erro no login após:', elapsedTime / 1000, 'segundos');

        clearTimeout(maxTimeout);
        this.isLoading = false;
        this.cdr.detectChanges();

        if (err.error?.data?.accountNumbers) {
          this.accountOptions = err.error.data.accountNumbers;
          this.showAccountSelection = true;
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
