import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { UserService, CreateAccountDto } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { finalize } from 'rxjs/operators';
import {
  faUserPlus,
  faClipboardList,
  faUser,
  faEnvelope,
  faIdCard,
  faShieldAlt,
  faLock,
  faCheck,
  faEye,
  faEyeSlash,
  faInfoCircle,
  faTimes,
  faUserShield,
  faUserCheck,
  faSpinner,
  faSignInAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, FaIconComponent],
  providers: [provideNgxMask()],
})
export class UserRegistration implements OnInit {

    faUserPlus = faUserPlus;
  faClipboardList = faClipboardList;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faIdCard = faIdCard;
  faShieldAlt = faShieldAlt;
  faLock = faLock;
  faCheck = faCheck;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faInfoCircle = faInfoCircle;
  faTimes = faTimes;
  faUserShield = faUserShield;
  faUserCheck = faUserCheck;
  faSpinner = faSpinner;
  faSignInAlt = faSignInAlt;
  faExclamationTriangle = faExclamationTriangle;

  // ✅ CONTROLE DE VISIBILIDADE DAS SENHAS
  showPassword = false;
  showConfirmPassword = false;

  isLoading: boolean = false;
  protected registrationForm!: FormGroup;
  showErrorModal: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  // O seu ngOnInit e outros métodos permanecem os mesmos...
  ngOnInit(): void {
    this.registrationForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        cpf: ['', [Validators.required, this.cpfValidator.bind(this)]],
        password: ['', [Validators.required, this.strongPasswordValidator()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  cpfValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Deixa passar se estiver vazio (o 'required' cuida disso)
    }

    // 1. Limpa a máscara, pegando apenas os números
    const cpf = control.value.replace(/\D/g, '');

    // 2. Validações básicas que você já tinha
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    // 3. Cálculo do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
      return { cpfInvalido: true }; // Retorna erro se o primeiro dígito estiver incorreto
    }

    // 4. Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
      return { cpfInvalido: true }; // Retorna erro se o segundo dígito estiver incorreto
    }

    // 5. Se passou por todas as validações, o CPF é válido
    return null;
  }

  strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Se o campo estiver vazio, o 'required' cuidará disso
      }

      const password = control.value;
      const errors: any = {};

      // Regra 1: Mínimo de 8 caracteres
      if (password.length < 8) {
        errors.minLength = true;
      }

      // Regra 2: Pelo menos uma letra maiúscula
      if (!/[A-Z]/.test(password)) {
        errors.missingUppercase = true;
      }

      // Regra 3: Pelo menos um caractere especial
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.missingSpecialChar = true;
      }

      // Regra 4: Pelo menos um número
      if (!/\d/.test(password)) {
        errors.missingNumber = true;
      }

      // Se o objeto 'errors' não estiver vazio, retorna os erros. Senão, retorna nulo (válido).
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (
      confirmPassword &&
      confirmPassword.hasError('passwordMismatch')
    ) {
      confirmPassword.setErrors(null);
    }
    return null;
  };

  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  // --- MÉTODO CADASTRAR CORRIGIDO ---
  Cadastrar() {
    this.markAllAsTouched(this.registrationForm);

    if (this.registrationForm.invalid) {
      this.showError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    this.isLoading = true; // 1. ATIVA o loading

    const formValues = this.registrationForm.getRawValue();
    const payload: CreateAccountDto = {
      name: formValues.name,
      email: formValues.email,
      cpf: formValues.cpf ? formValues.cpf.replace(/\D/g, '') : '',
      password: formValues.password,
    };

    this.userService
      .CreateUserWithAccount(payload)
      .pipe(
        // 2. O FINALIZE GARANTE QUE O LOADING SEMPRE SERÁ DESATIVADO
        finalize(() => {
          this.isLoading = false;
          // Forçamos a detecção para garantir que a interface (botão/spinner) seja atualizada
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          // 3. O 'next' agora só se preocupa com a lógica de negócio
          if (response && response.data) {
            this.alertService.showSuccess(
              'Sucesso!',
              'Cadastro realizado com sucesso!'
            );
            this.router.navigate(['/login']);
          } else {
            // Erro de negócio (CPF duplicado, etc.)
            this.showError(response.message || 'Ocorreu um erro no cadastro.');
          }
        },
        error: (err) => {
          // 4. E o 'error' só se preocupa em tratar erros de conexão/servidor
          this.showError(err.error?.message || 'Erro interno do servidor.');
        },
      });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
    this.cdr.detectChanges();
  }
}
