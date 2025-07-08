import { Component, Inject } from '@angular/core';
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
  accountNumberTo: string = '';
  amount: number = 0;
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

    this.http.post('https://localhost:7178/user/api/Transfer/Transfer', dto).subscribe({
      next: (res: any) => {
        if (res?.data) {
          console.log('Transferência realizada com sucesso');
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


