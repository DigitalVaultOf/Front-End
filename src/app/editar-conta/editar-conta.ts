import { Component, Inject, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable, forkJoin } from 'rxjs';

export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get('novaSenha');
  const confirmNewPassword = control.get('confirmarNovaSenha');

  if (
    !newPassword ||
    !confirmNewPassword ||
    !newPassword.value ||
    !confirmNewPassword.value
  ) {
    return null;
  }

  return newPassword.value === confirmNewPassword.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-editar-conta',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-conta.html',
  styleUrls: ['./editar-conta.scss'],
})
export class EditarConta implements OnInit {
  usuarioForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UserService,
    private route: ActivatedRoute,
    @Inject(OverlayRef) private overlayRef: OverlayRef
  ) {}

  closeModal() {
    this.overlayRef.dispose();
  }

  ngOnInit(): void {
    this.usuarioForm = this.fb.group(
      {
        id: [{ value: '', disabled: true }],
        accountNumber: [{ value: '', disabled: true }],
        cpf: [{ value: '', disabled: true }],
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        senhaAtual: [''],
        novaSenha: [''],
        confirmarNovaSenha: [''],
      },
      { validators: passwordMatchValidator }
    );

    this.usuarioForm.get('senhaAtual')?.valueChanges.subscribe(() => {
      if (this.usuarioForm.get('senhaAtual')?.hasError('senhaIncorreta')) {
        this.usuarioForm.get('senhaAtual')?.setErrors(null);
      }
    });

    this.usuarioService.GetUserById().subscribe({
      next: (usuario) => {
        console.log('Dados recebidos da API:', usuario);
        this.usuarioForm.patchValue({
          id: usuario.id,
          accountNumber: usuario.accountNumber,
          cpf: usuario.cpf,
          nome: usuario.name,
          email: usuario.email,
        });
      },
      error: (err) => {
        console.error('Falha ao buscar dados do usuário:', err);
        alert(
          'Não foi possível carregar os dados do usuário. Verifique o console para mais detalhes.'
        );
        this.closeModal();
      },
    });
  }

  atualizarUsuario() {
    if (this.usuarioForm.invalid) {
      if (this.usuarioForm.errors?.['passwordMismatch']) {
        alert('A nova senha e a confirmação não coincidem.');
      }
      return;
    }

    const rawValues = this.usuarioForm.getRawValue();
    const updateObservables: Observable<any>[] = [];

    if (
      this.usuarioForm.get('nome')?.dirty ||
      this.usuarioForm.get('email')?.dirty
    ) {
      const dadosAtualizados = {
        id: rawValues.id,
        name: rawValues.nome,
        email: rawValues.email,
        cpf: rawValues.cpf,
        accountNumber: rawValues.accountNumber,
      };
      updateObservables.push(this.usuarioService.UpdateUser(dadosAtualizados));
    }

    if (
      rawValues.senhaAtual &&
      rawValues.novaSenha &&
      rawValues.confirmarNovaSenha
    ) {
      const dadosSenha = {
        currentPassword: rawValues.senhaAtual,
        newPassword: rawValues.novaSenha,
        confirmNewPassword: rawValues.confirmarNovaSenha,
      };
      updateObservables.push(this.usuarioService.UpdatePassword(dadosSenha));
    }

    if (updateObservables.length === 0) {
      console.log('Nenhum dado foi modificado.');
      alert('Nenhum dado foi modificado.');
      return;
    }

    forkJoin(updateObservables).subscribe({
      next: () => {
        console.log('Dados atualizados com sucesso!');
        alert('Dados atualizados com sucesso!');
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        if (err.error && err.error.message === 'Senha atual incorreta.') {
          this.usuarioForm
            .get('senhaAtual')
            ?.setErrors({ senhaIncorreta: true });
        }
        const alertMessage =
          err.error?.message ||
          'Ocorreu um erro ao salvar as alterações. Tente novamente.';
        alert(alertMessage);
      },
    });
  }
}
