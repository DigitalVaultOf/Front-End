// export.ts - VERSÃO ALTERNATIVA COM CHAMADA PARA VERIFICAR DADOS
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../services/export.service';
import { AlertService } from '../services/alert.service';
import { Estrato } from '../services/estrato'; // ✅ SERVIÇO DE HISTÓRICO
import { OverlayRef } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // ✅ ADICIONAR
import {
  faDownload,
  faFilePdf,
  faFileExcel,
  faChevronRight,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './export.html',
  styleUrls: ['./export.scss'],
})
export class Export {

    faDownload = faDownload;
  faFilePdf = faFilePdf;
  faFileExcel = faFileExcel;
  faChevronRight = faChevronRight;
  faTimes = faTimes;
  
  constructor(
    private exportService: ExportService,
    private alertService: AlertService,
    private extrato: Estrato, // ✅ INJETAR SERVIÇO DE HISTÓRICO
    private overlayRef: OverlayRef
  ) {}

  // ✅ MÉTODO PARA VERIFICAR SE HÁ DADOS NO SERVIDOR
  private async checkTransactionHistory(): Promise<boolean> {
    try {
      const response = await this.extrato.getHistory().toPromise() as any;
      return response?.data && response.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar histórico:', error);
      return false;
    }
  }

  // ✅ MÉTODO PARA MOSTRAR AVISO
  private showNoDataWarning(): void {
    this.alertService.showWarning(
      'Sem Dados para Exportar',
      'Você não possui nenhum histórico de transações para exportar.'
    );
    this.closeModal();
  }

  async gerarPDF(): Promise<void> {
    // ✅ VERIFICAR SE HÁ DADOS
    const hasData = await this.checkTransactionHistory();
    
    if (!hasData) {
      this.showNoDataWarning();
      return;
    }

    this.exportService.generatePDF().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.alertService.showSuccess(
          'PDF Gerado!',
          'Seu relatório foi baixado com sucesso.'
        );
        
        this.closeModal();
      },
      error: (error) => {
        console.error('Erro ao obter o PDF', error);
        this.alertService.showError(
          'Erro ao Gerar PDF',
          'Ocorreu um erro ao gerar o relatório. Tente novamente.'
        );
      }
    });
  }

  async gerarCSV(): Promise<void> {
    // ✅ VERIFICAR SE HÁ DADOS
    const hasData = await this.checkTransactionHistory();
    
    if (!hasData) {
      this.showNoDataWarning();
      return;
    }

    this.exportService.generateCSV().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.alertService.showSuccess(
          'Excel Gerado!',
          'Sua planilha foi baixada com sucesso.'
        );
        
        this.closeModal();
      },
      error: (error) => {
        console.error('Erro ao obter o CSV', error);
        this.alertService.showError(
          'Erro ao Gerar Excel',
          'Ocorreu um erro ao gerar a planilha. Tente novamente.'
        );
      }
    });
  }

  closeModal(): void {
    this.overlayRef.dispose();
  }
}