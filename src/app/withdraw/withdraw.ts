import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Home } from '../home/home';

import {
  faMoneyBillWave,
  faTimes,
  faDollarSign,
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
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './withdraw.html',
  styleUrls: ['./withdraw.scss'],
})
export class Withdraw {

 faMoneyBillWave = faMoneyBillWave;
  faTimes = faTimes;
  faDollarSign = faDollarSign;
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

  @Input() withdraw: any;
  @Input() onReloadTable?: () => void;
  valor: number = 0.00;
  senha: string = '';
  exibirSenha: boolean = false;
  mensagemErro: string | null = null;


  constructor(
    @Inject(OverlayRef) private overlayRef: OverlayRef,
    private http: HttpClient
  ) {}

  closeModal() {
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
      // Verifica se o valor colado é negativo ou não numérico
      if (clipboardData.startsWith('-') || isNaN(Number(clipboardData)) || Number(clipboardData) < 0) {
        event.preventDefault();
      }
    } 
  }

  sacar() {
    if (!this.exibirSenha) {
      this.exibirSenha = true;
      return;
    }
  
    const dto = {
      value: this.valor,
      password: this.senha
    };
  
    this.http
      .post('http://localhost:5002/api/Movimentation/whitdraw', dto)
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.mensagemErro = null;
            this.onReloadTable?.();
            this.closeModal();
          } else {
            this.mensagemErro = res?.message || 'Erro ao realizar saque.';
          }
        },
        error: (err) => {
          this.mensagemErro = err.error?.message || 'Erro ao realizar saque.';
        }

        
      });
  }
  
}
