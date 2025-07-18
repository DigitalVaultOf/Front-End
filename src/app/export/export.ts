import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { ExportService } from '../services/export.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';


@Component({
  selector: 'app-export',
  templateUrl: './export.html',
  styleUrls: ['./export.scss']
})
export class Export {

  constructor(
    private exportService: ExportService,
    private overlayRef: OverlayRef
  ) {}

  gerarPDF(): void {
    this.exportService.generatePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Erro ao obter o PDF', error);
      }
    );
  }

  gerarCSV(): void {
    this.exportService.generateCSV().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Erro ao obter o CSV', error);
      }
    );
  }

  closeModal(): void {
      this.overlayRef.dispose();
  }
}
