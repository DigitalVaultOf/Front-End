import {
  Component,
  Input,
  Inject, // <-- Importar Inject
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Auth } from '../services/auth';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-deletar-conta',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './deletar-conta.html',
  styleUrls: ['./deletar-conta.scss'],
})
export class DeletarConta implements AfterViewInit {
  // <-- Implementa AfterViewInit
  @Input() accountNumber!: string;
  faTimes = faTimes;

  // Referência ao nosso contêiner do modal no HTML
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    @Inject(OverlayRef) private overlayRef: OverlayRef, // <-- Adicionado @Inject para clareza
    private auth: Auth,
    private router: Router
  ) {}

  // ngAfterViewInit é chamado depois que o HTML do componente é renderizado
  ngAfterViewInit(): void {
    // Adiciona a classe 'open' para acionar a animação de entrada
    setTimeout(() => {
      this.modalContainer.nativeElement.classList.add('open');
    }, 10);
  }

  // closeModal agora anima antes de fechar
  closeModal() {
    // 1. Remove a classe 'open' para acionar a animação de saída
    this.modalContainer.nativeElement.classList.remove('open');

    // 2. Espera a animação (300ms) terminar antes de destruir o overlay
    setTimeout(() => {
      this.overlayRef.dispose();
    }, 300);
  }

  // O método confirmarExclusao só precisa de uma pequena mudança: chamar o novo closeModal
  confirmarExclusao(): void {
    if (!this.accountNumber) {
      console.error('Número da conta não fornecido.');
      this.alertService.showError(
        'Ops! Algo deu errado...',
        'Número da conta não fornecido.'
      );
      return;
    }

    this.userService.DeleteUser(this.accountNumber).subscribe({
      next: (sucesso) => {
        this.alertService.showSuccess(
          'Sucesso!',
          'Conta desativada com sucesso. Você será desconectado(a).'
        );
        this.auth.logout();
        this.closeModal(); // <-- Já contém a lógica de animação e dispose
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro ao desativar a conta:', err);
        const alertMessage =
          err.error?.message ||
          'Não foi possível desativar a conta. Tente novamente.';
        this.alertService.showError('Ops! Algo deu errado...', alertMessage);
      },
    });
  }
}
