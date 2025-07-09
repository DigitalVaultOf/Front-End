import { Component, Input } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Auth } from '../services/auth';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-deletar-conta',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './deletar-conta.html',
  styleUrls: ['./deletar-conta.scss'],
})
export class DeletarConta {
  @Input() accountNumber!: string;
  faTimes = faTimes;

  constructor(
    private userService: UserService,
    private overlayRef: OverlayRef,
    private auth: Auth,
    private router: Router
  ) {}

  closeModal() {
    this.overlayRef.dispose();
  }

  confirmarExclusao(): void {
    if (!this.accountNumber) {
      console.error('Número da conta não fornecido.');
      alert('Número da conta não fornecido.');
      return;
    }

    this.userService.DeleteUser(this.accountNumber).subscribe({
      next: (sucesso) => {
        alert('Conta excluída com sucesso. Você será desconectado.');
        this.auth.logout();
        this.closeModal();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro ao desativar a conta:', err);
        const alertMessage =
          err.error?.message ||
          'Não foi possível desativar a conta. Tente novamente.';
        alert(alertMessage);
      },
    });
  }
}
