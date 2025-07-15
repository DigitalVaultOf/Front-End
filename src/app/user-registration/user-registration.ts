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

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
})
export class UserRegistration implements OnInit {
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
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  cpfValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    const cpfNumbers = control.value.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return { cpfIncompleto: true };
    }
    if (/^(\d)\1{10}$/.test(cpfNumbers)) {
      return { cpfRepetido: true };
    }
    return null;
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
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

    this.userService.CreateUserWithAccount(payload)
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
            this.alertService.showSuccess('Sucesso!', 'Cadastro realizado com sucesso!');
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