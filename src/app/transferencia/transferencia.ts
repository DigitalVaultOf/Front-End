import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transferencia.html',
  styleUrls: ['./transferencia.scss'],
})
export class Transferencia {
  @Input() transferencia: any;
  @Input() onReloadTable?: () => void;
  accountNumberTo: string = '';
  amount: number = 0.00;
  description: string = '';
  password: string = '';
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;

  constructor(
    @Inject(OverlayRef) private overlayRef: OverlayRef,
    private http: HttpClient
  ) {}

  closeModal() {
    this.overlayRef.dispose();
  }

  preventNegativeInput(event: KeyboardEvent): void{
    const input = event.key;
    const value = (event.target as HTMLInputElement).value;

     if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(input)) {
      return;
    }

    if (input === '-') {
      event.preventDefault();
      return;
    }

    if (!/^\d$/.test(input) && input !== '.' && input !== ',') {
      event.preventDefault();
      return;
    }

    if ((input === '.' || input === ',') && (value.includes('.') || value.includes(','))) {
      event.preventDefault();
      return;
    }
  }

  onPaste(event : ClipboardEvent): void{
    const clipboardData = event.clipboardData?.getData('text');
    if(clipboardData){
      if(clipboardData.startsWith('-') || isNaN(Number(clipboardData)) || Number(clipboardData) < 0){
        event.preventDefault();
      }
    }
  }

  transferir() {
    if (!this.exibirSenha) {
      this.exibirSenha = true;
      return; 
    }

    this.mensagemErro = null;

    const dto = {
      accountNumberTo: this.accountNumberTo,
      amount: this.amount,
      description: this.description,
      password: this.password,
    };

    this.http.post('http://localhost:5005/transfer/api/Transfer', dto).subscribe({
      next: (res: any) => {
        if (res?.data) {
          console.log('Transferência realizada com sucesso');
          this.onReloadTable?.();
          this.closeModal();
        } else {
          this.mensagemErro = res?.message || 'Erro desconhecido na transferência.';
        }
      },
      error: (err) => {
        this.mensagemErro = err.error?.message || 'Erro ao realizar transferência.';
        console.error('Erro na transferência:', err);
      }
    });
  }
}


