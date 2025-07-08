import { Component, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-conta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './editar-conta.html',
  styleUrls: ['./editar-conta.scss']
})
export class EditarConta implements OnInit {
  // Propriedades para os campos de visualização
  idContaCorrente: string = '';
  idContaPoupanca: string = '';
  idUsuario: string = '';
  cpf: string = '';

  // Propriedades para os campos editáveis
  nome: string = '';
  email: string = '';
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarNovaSenha: string = '';

  constructor(private overlayRef: OverlayRef) { }

  ngOnInit(): void {
    // Simulando a busca dos dados do usuário logado
    this.idContaCorrente = '218048';
    this.idContaPoupanca = '923569';
    this.idUsuario = 'd2794289-f2d8-432e-9ba8-e33bd92944ff';
    this.cpf = '123.456.789-10';
    this.nome = 'Seu Nome Atual';
    this.email = 'seu@email.com';
  }

  confirmar(): void {
    if (this.novaSenha !== this.confirmarNovaSenha) {
      alert('A nova senha e a confirmação não correspondem.');
      return;
    }

    console.log('Dados para salvar:', {
      nome: this.nome,
      email: this.email,
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha,
    });

    alert('Conta atualizada com sucesso! (Verifique os dados no console)');
    this.close();
  }

  cancelar(): void {
    this.close();
  }

  private close(): void {
    this.overlayRef.dispose();
  }
}