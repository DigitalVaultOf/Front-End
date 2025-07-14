import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input } from '@angular/core';
import { Deposit } from '../services/deposit';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposito.html',
  styleUrl: './deposito.scss',
})
export class Deposito {
  @Input() deposito: any;
  valorDeposito: number = 0;
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

    if (
      !/^\d$/.test(input) &&
      input !== '.' &&
      input !== ',' &&
      input !== 'Backspace' &&
      input !== 'Delete' &&
      input !== 'ArrowLeft' &&
      input !== 'ArrowRight' &&
      input !== 'Tab'
    ) {
      event.preventDefault();
    }

    if (value.startsWith('-') || isNaN(Number(value))) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData && (clipboardData.startsWith('-') || isNaN(Number(clipboardData)))) {
      event.preventDefault();
    }
  }

  /**
   * Centraliza a lógica de tratamento de erros para definir a mensagem
   * local e exibir um alerta global.
   * @param message A mensagem de erro a ser exibida.
   */
  private handleError(message: string): void {
    this.mensagemErro = message;
    this.alertService.showError('Ops! Algo deu errado...', message);
    this.cdr.detectChanges(); // Garante que a mensagem de erro seja exibida no template
  }

  confirmarDeposito(): void {
    // 1. Se o campo de senha ainda não estiver visível, apenas o exibe e para a execução.
    if (!this.exibirSenha) {
      this.exibirSenha = true;
      // O ChangeDetectorRef pode ser útil aqui se a exibição não for imediata
      this.cdr.detectChanges();
      return;
    }

    // 2. Prepara os dados para a requisição
    const dto = {
      value: this.valorDeposito,
      password: this.senha,
    };

    // 3. Chama o serviço de depósito e se inscreve para a resposta
    this.depositService.deposit(dto).subscribe({
      next: (res: any) => {
        // --- SUCESSO ---
        if (res?.data) {
          this.mensagemErro = null;
          this.alertService.showSuccess(
            'Sucesso!',
            'Depósito realizado com sucesso!'
          );
          this.closeModal();
        } else {
          // --- ERRO DE NEGÓCIO (API retornou 200, mas com falha) ---
          this.handleError(res?.message || 'Não foi possível realizar o depósito.');
        }
      },
      error: (err) => {
        // --- ERRO DE CONEXÃO/HTTP (API retornou 4xx ou 5xx) ---
        this.handleError(err.error?.message || 'Erro ao comunicar com o servidor.');
      },
    });
  }
}