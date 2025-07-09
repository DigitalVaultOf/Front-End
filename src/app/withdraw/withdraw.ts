import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdraw.html',
  styleUrls: ['./withdraw.scss'],
})
export class Withdraw {
  valor: number = 0;
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
      .post('https://localhost:7178/user/api/Movimentation/whitdraw', dto)
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.mensagemErro = null;
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
