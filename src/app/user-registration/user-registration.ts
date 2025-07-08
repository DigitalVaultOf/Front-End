import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { provideNgxMask } from 'ngx-mask'; // Importação correta para componentes standalone
import { cadastrar } from '../services/cadastroService'; // Importando o serviço de cadastro

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [provideNgxMask()], // Onde NgxMask é fornecido para o componente
})
export class UserRegistration implements OnInit {
  protected title = 'User-Registration-Net';
  protected registrationForm!: FormGroup;
  
  cpfMask = '';
  showContent = true;

  constructor(private router: Router, private fb: FormBuilder, private cadastroSer: cadastrar)
    {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/@/)]],
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
    
    if (this.registrationForm.valid) {
      this.cadastroSer.cadastrarUsuario(this.registrationForm.value).subscribe({
        next: (response) => {
          console.log('Cadastro realizado com sucesso!', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Erro no cadastro:', error);
        }
      });
  
    }else{
      this.markAllAsTouched(this.registrationForm);
      console.log('Formulário inválido');
      alert('Por favor, preencha todos os campos corretamente. Verifique todos os campos e tente novamente.');
    }
  }
}
