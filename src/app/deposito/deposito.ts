import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, Input } from '@angular/core';
import { Deposit } from '../services/deposit';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposito.html',
  styleUrl: './deposito.scss'
})
export class Deposito {
  @Input() deposito: any;
  valorDeposito: number = 0;
  senha: string = '';
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;


  constructor(@Inject(OverlayRef) private overlayRef: OverlayRef, private depositService: Deposit,  private cdr: ChangeDetectorRef) {}

  closeModal() {
  console.log('Fechando modal...');
  this.overlayRef.dispose();
  }

  preventNegativeInput(event: KeyboardEvent): void {
    const input = event.key;
    const value = (event.target as HTMLInputElement).value;

    if (
      !/^\d$/.test(input) && // Não é um dígito
      input !== '.' && // Permite ponto decimal
      input !== ',' && // Permite vírgula decimal (se for o caso da sua localidade)
      input !== 'Backspace' &&
      input !== 'Delete' &&
      input !== 'ArrowLeft' &&
      input !== 'ArrowRight' &&
      input !== 'Tab'
    ) {
      event.preventDefault(); // Impede a digitação
    }

    // Verifica se o valor é negativo ou não numérico
    if (value.startsWith('-') || isNaN(Number(value))) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
  const clipboardData = event.clipboardData?.getData('text');
  if (clipboardData) {
    // Verifica se o valor colado é negativo ou não numérico
    if (clipboardData.startsWith('-') || isNaN(Number(clipboardData))) {
      event.preventDefault();
    }
  } 
}

  confirmarDeposito() {
    console.log('ConfirmarDeposito acionado');
    
    if (!this.exibirSenha) {
      console.log('Exibindo campo de senha...');
      this.exibirSenha = true;
  
      this.cdr.detectChanges();
  
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
  
      return;
    }
  
    const dto = {
      value: this.valorDeposito,
      password: this.senha
    };
  
    this.depositService.deposit(dto).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.mensagemErro = null;
          this.closeModal();
        } else {
          this.mensagemErro = res?.message || 'Algo deu errado.';
        }
      },
      error: (err) => {
        this.mensagemErro = err.error?.message || 'Erro ao fazer depósito.';
      }
    });
  }
  
  
  
  
}
