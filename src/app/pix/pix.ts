import { Component, Input, ChangeDetectorRef, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { PixS, PixResponse } from '../services/pix';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-pix',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pix.html',
  styleUrl: './pix.scss',
})
export class Pix {
  @Input() chavePix: string = '';
  valorPix: number | null = null;
  senha: string = '';
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;
  modo: 'menu' | 'transferencia' | 'chave' | 'historico' = 'menu';
  novaChave: string = '';
  historico: Array<{ descricao: string }> = [];
  chaves: Array<{ id: number; tipo: string; valor: string }> = [];
  chaveEmEdicao: { id: number; tipo: string; valor: string } | null = null;
  temPix: boolean | null = null;
  chave: string = "";
  going: string = "";
  amount: number = 0.0;

  private http = inject(HttpClient);

  constructor(
    private overlayRef: OverlayRef,
    private cdr: ChangeDetectorRef,
    private pixService: PixS
  ) {}

  ngOnInit(): void {
    this.pixService.hasPix().subscribe({
      next: (res) => {
        this.temPix = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao verificar Pix:', err);
        this.temPix = false;
        this.cdr.detectChanges();
      },
    });
    this.pixService.getPix().subscribe({
      next: (res) => {
        this.chave = res.data;
        this.cdr.detectChanges();
        console.log(this.chave);
      },
      error: (err) => {
        console.error('Erro ao verificar Pix:', err);
        this.chave = "";
        this.cdr.detectChanges();
      },
    });
  }

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

    this.mensagemErro = null;
    this.closeModal();
  }

  salvarChavePix() {
    if (!this.novaChave) return;

    if (this.chaveEmEdicao) {
      this.http
        .put(`/api/pix/chaves/${this.chaveEmEdicao.id}`, {
          valor: this.novaChave,
        })
        .subscribe(() => {
          this.resetarFormularioChave();
          this.carregarChaves();
        });
    } else {
      this.http
        .post('/api/pix/chaves', {
          valor: this.novaChave,
          tipo: 'email',
        })
        .subscribe(() => {
          this.resetarFormularioChave();
          this.carregarChaves();
        });
    }
  }

  resetarFormularioChave() {
    this.novaChave = '';
    this.chaveEmEdicao = null;
    this.modo = 'menu';
  }

  selecionarChaveParaEditar(chave: {
    id: number;
    tipo: string;
    valor: string;
  }) {
    this.novaChave = chave.valor;
    this.chaveEmEdicao = chave;
    this.modo = 'chave';
  }

  abrirHistorico() {
    this.modo = 'historico';
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.http.get<any[]>('/api/pix/historico').subscribe({
      next: (res) => {
        this.historico = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historico = [];
        this.mensagemErro = 'Erro ao carregar histórico';
        this.cdr.detectChanges();
      },
    });
  }

  abrirChaves() {
    this.modo = 'chave';
    this.carregarChaves();
  }

  carregarChaves() {
    this.http.get<any[]>('/api/pix/chaves').subscribe({
      next: (res) => {
        this.chaves = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chaves = [];
        this.mensagemErro = 'Erro ao carregar chaves';
        this.cdr.detectChanges();
      },
    });
  }

  closeModal(): void {
    this.overlayRef.dispose();
  }

  enviarPix(): void {
    const data = {
      going: this.going,
      coming: this.chave,
      amount: this.amount,
    };
    this.pixService.makePix(data).subscribe({});
  }
}