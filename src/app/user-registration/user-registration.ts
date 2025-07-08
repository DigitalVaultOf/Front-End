import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { provideNgxMask } from 'ngx-mask'; // Importação correta para componentes standalone
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  providers: [provideNgxMask()], // Onde NgxMask é fornecido para o componente
})
export class UserRegistration implements OnInit {
  protected title = 'User-Registration-Net';
  protected registrationForm!: FormGroup;
  cpfMask = '';
  showContent = true;

  constructor(private router: Router, private fb: FormBuilder)
    {

    }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
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
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  cadastro() {
    // Descomentei a lógica de validação
    if (this.registrationForm.valid) {
      console.log('Formulário válido!', this.registrationForm.value); // Para depuração
      this.router.navigate(['/login']);
    } else {
      this.markAllAsTouched(this.registrationForm);
      console.log('Por favor, preencha todos os campos corretamente ou verifique os erros.'); // Substituído alert por console.log
    }
  }
}
