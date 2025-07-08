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

  constructor(private router: Router, private fb: FormBuilder) 
    {

    } // Injete FormBuilder

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required], // Campo para o nome que usa o validador 'required' para que seja obrigatório o preenchimento
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // Adicione o validador customizado
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {//é instanciado o password e confirmPassword, para que posssa ser verificado se os valores não são nulos, sendo assim elses são aplicados no inicio do 

      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };

    } else if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  };
  

  // Função auxiliar para marcar todos os controles do formulário como 'touched', se o usuário interagir com o formulário, irá aparecer os "erros", caso não tenha sido preenchido corretamente
  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

//depois tenho que fazer a ógica certa do cadastro
  cadastro() {
    //if (this.registrationForm.valid) {  
      this.router.navigate(['/login']); // Redireciona para a página de login após o cadastro
   // } else {
    //   this.markAllAsTouched(this.registrationForm); // Marca todos os campos como 'touched' para exibir erros de validação
    //   alert('Por favor, preencha todos os campos corretamente.');
    // }
  }
}