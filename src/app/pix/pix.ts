import { Component } from '@angular/core';

@Component({
  selector: 'app-pix',
  imports: [],
  templateUrl: './pix.html',
  styleUrl: './pix.scss'
})
export class Pix {
chavePix: string = '';
valorPix: number | null = null;
senha: string = '';
mensagemErro: string | null = null;
exibirSenha: boolean = false;

confirmarPix() {
  if (!this.exibirSenha) {
    // Etapa 1 concluída, agora pede a senha
    this.exibirSenha = true;
  } else {
    // Validação da senha e envio
    if (this.senha !== 'suaSenhaSimulada') {
      this.mensagemErro = 'Senha incorreta';
      return;
    }

    // Aqui você pode chamar o service para enviar o Pix
    console.log(`Enviando R$ ${this.valorPix} para ${this.chavePix}`);
    this.closeModal();
  }
}

closeModal() {
  // lógica para fechar modal
}

}
