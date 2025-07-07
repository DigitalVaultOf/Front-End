import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  constructor(
    @Inject(OverlayRef) private overlayRef: OverlayRef,
    private http: HttpClient
  ) {}

  closeModal() {
    this.overlayRef.dispose();
  }

  transferir() {
    this.http.post('https://localhost:7178/user/api/Transfer/Transfer', {
      accountNumberTo: this.accountNumberTo,
      amount: this.amount,
      description: this.description
    }).subscribe(res => {
      console.log('Transferência enviada', res);
      this.closeModal();
    });
  }
}
