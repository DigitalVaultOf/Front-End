import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input } from '@angular/core';
import { Deposit } from '../services/deposit';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../services/alert.service';
import {
  faPiggyBank,
  faTimes,
  faCoins,
  faMoneyBillAlt,
  faInfoCircle,
  faShieldAlt,
  faReceipt,
  faLock,
  faExclamationTriangle,
  faUserShield,
  faArrowLeft,
  faCheck,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './deposito.html',
  styleUrl: './deposito.scss',
})
export class Deposito {

    faPiggyBank = faPiggyBank;
  faTimes = faTimes;
  faCoins = faCoins;
  faMoneyBillAlt = faMoneyBillAlt;
  faInfoCircle = faInfoCircle;
  faShieldAlt = faShieldAlt;
  faReceipt = faReceipt;
  faLock = faLock;
  faExclamationTriangle = faExclamationTriangle;
  faUserShield = faUserShield;
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faArrowRight = faArrowRight;

  @Input() deposito: any;
  @Input() onReloadTable?: () => void;
  valorDeposito: number = 0.00;
  senha: string = '';
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;

  constructor(
    private overlayRef: OverlayRef,
    private alertService: AlertService,
    private depositService: Deposit,
    private cdr: ChangeDetectorRef // Mantido para o controle de 'exibirSenha'
  ) {}

  closeModal(): void {
    console.log('Fechando modal...');
    this.overlayRef.dispose();
  }

  preventNegativeInput(event: KeyboardEvent): void {
    const input = event.key;
    const value = (event.target as HTMLInputElement).value;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(input)) {
        return;
      }

      // Permite dígitos e apenas um ponto/vírgula decimal
      if (!/^\d$/.test(input) && input !== '.' && input !== ',') {
        event.preventDefault();
        return;
      }


      if (input === '-') {
        event.preventDefault();
        return;
      }

      // Impede múltiplos pontos/vírgulas
      if ((input === '.' || input === ',') && (value.includes('.') || value.includes(','))) {
        event.preventDefault();
        return;
      }
  }

  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData) {
      if (clipboardData.startsWith('-') || isNaN(Number(clipboardData)) || Number(clipboardData) < 0) {
        event.preventDefault();
      }
    } 
  }

  confirmarDeposito() {
    console.log('ConfirmarDeposito acionado');

    if(this.valorDeposito < 0){
      this.mensagemErro = "O valor do depósito não pode ser negativo."
      return
    }
    if (!this.exibirSenha) {
      this.exibirSenha = true;
      this.cdr.detectChanges();
      return;
    }

    // 2. Prepara os dados para a requisição
    const dto = {
      value: this.valorDeposito,
      password: this.senha,
    };

    this.depositService.deposit(dto).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.mensagemErro = null;
          this.alertService.showSuccess(
            'Sucesso!',
            'Depósito realizado com sucesso!'
          );
          this.onReloadTable?.();
          this.closeModal();
        } else {
          this.handleError(res?.message || 'Não foi possível realizar o depósito.');
        }
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Erro ao comunicar com o servidor.');
      },
    });
  }
 
  private handleError(message: string): void {
    this.mensagemErro = message;
    this.alertService.showError('Ops! Algo deu errado...', message);
    this.cdr.detectChanges(); // Garante que a mensagem de erro seja exibida no template 
  }
}


  


