import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Importe OnInit
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms'; // Importe FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.scss'],
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, FormsModule] 
})
export class UserRegistration implements OnInit { 
  protected title = 'User-Registration-Net';
  protected registrationForm!: FormGroup;
  showContent = true;

  constructor(private router: Router, private fb: FormBuilder) {} // Injete FormBuilder

  ngOnInit(): void {
    // Inicialize seu formulário reativo aqui
    this.registrationForm = this.fb.group({
      name: ['', Validators.required], // Campo para o nome
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]], // Campo para o CPF
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo para a senha
      confirmPassword: ['', Validators.required] // Campo para confirmar a senha
    }, { validators: this.passwordMatchValidator }); // Adicione o validador customizado
  }

  // Validador customizado para verificar se as senhas coincidem
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Define um erro no controle de confirmPassword se não coincidir
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      // Limpa o erro se as senhas agora coincidem
      confirmPassword.setErrors(null);
    }
    return null;
  };
  

  // Função auxiliar para marcar todos os controles do formulário como 'touched'
  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }
}