import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pix.html',
  styleUrl: './pix.scss'
})
export class Pix {
  @Input() chavePix: string = '';
  valorPix: number | null = null;
  senha: string = '';
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;

  constructor(
    private overlayRef: OverlayRef,
    private cdr: ChangeDetectorRef
  ) {}

  confirmarPix() {
    if (!this.exibirSenha) {
      this.exibirSenha = true;
      this.cdr.detectChanges();
      return;
    }

    if (this.senha !== 'suaSenhaSimulada') {
      this.mensagemErro = 'Senha incorreta';
      this.cdr.detectChanges();
      return;
    }

    console.log(`Enviando R$ ${this.valorPix} para ${this.chavePix}`);
    this.mensagemErro = null;
    this.closeModal();
  }

  closeModal(): void {
    console.log('Fechando modal Pix...');
    this.overlayRef.dispose();
  }
}
