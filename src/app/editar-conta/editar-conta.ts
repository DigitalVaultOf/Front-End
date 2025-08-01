import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
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
import { AlertService } from '../services/alert.service';
import { FontAwesomeModule, FaIconComponent } from '@fortawesome/angular-fontawesome'; // ✅ ADICIONAR
import {
  faEdit,
  faBuilding,
  faIdCard,
  faCreditCard,
  faTimes,
  faAddressCard,
  faUser,
  faUserEdit,
  faLock,
  faKey,
  faExclamationTriangle,
  faLockOpen,
  faCheck,
  faArrowLeft,
  faSave,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: './editar-conta.html',
  styleUrls: ['./editar-conta.scss'],
})
export class EditarConta implements OnInit, AfterViewInit {
  faEdit = faEdit;
  faBuilding = faBuilding;
  faIdCard = faIdCard;
  faCreditCard = faCreditCard;
  faTimes = faTimes;
  faAddressCard = faAddressCard;
  faUser = faUser;
  faUserEdit = faUserEdit;
  faLock = faLock;
  faKey = faKey;
  faExclamationTriangle = faExclamationTriangle;
  faLockOpen = faLockOpen;
  faCheck = faCheck;
  faArrowLeft = faArrowLeft;
  faSave = faSave;
  faEnvelope = faEnvelope;
  
  usuarioForm!: FormGroup;
  isModalVisible = false; // Controla a visibilidade do modal

  @ViewChild('modalContainer') modalContainer!: ElementRef;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private usuarioService: UserService,
    private route: ActivatedRoute,
    @Inject(OverlayRef) private overlayRef: OverlayRef
  ) {}

  closeModal() {
    // 1. Removemos a classe 'open'. O CSS cuidará da animação de saída.
    this.modalContainer.nativeElement.classList.remove('open');

    // 2. Esperamos a animação (300ms) terminar antes de destruir o overlay.
    setTimeout(() => {
      this.overlayRef.dispose();
    }, 300);
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
        this.alertService.showError(
          'Ops! Algo deu errado...',
          'Não foi possível carregar os dados do usuário.'
        );
        this.closeModal();
      },
    });
  }

  ngAfterViewInit(): void {
    // Usamos um pequeno timeout para garantir que o navegador aplique os estilos iniciais antes de animar
    setTimeout(() => {
      this.modalContainer.nativeElement.classList.add('open');
    }, 10);
  }

  atualizarUsuario() {
    if (this.usuarioForm.invalid) {
      if (this.usuarioForm.errors?.['passwordMismatch']) {
        this.alertService.showError(
          'Ops! Algo deu errado...',
          'A nova senha e a confirmação não coincidem.'
        );
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
      this.alertService.showWarning(
        'Ei! Nada mudou por aqui...',
        'Nenhum dado foi modificado.'
      );

      return;
    }

    forkJoin(updateObservables).subscribe({
      next: () => {
        console.log('Dados atualizados com sucesso!');
        this.alertService.showSuccess(
          'Sucesso!',
          'Seus dados foram atualizados com sucesso!'
        );
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
        this.alertService.showError('Ops! Algo deu errado...', alertMessage);
      },
    });
  }
}
