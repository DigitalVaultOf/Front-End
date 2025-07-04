import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './withdraw.html',
  styleUrls: ['./withdraw.scss'],
})
export class Withdraw {
  valor: number = 0;

  constructor(
    @Inject(OverlayRef) private overlayRef: OverlayRef,
    private http: HttpClient
  ) {}

  closeModal() {
    this.overlayRef.dispose();
  }

  sacar() {
    this.http.post('https://localhost:7178/user/api/Movimentation/whitdraw', { value: this.valor }).subscribe(res => {
      console.log('Saque enviado', res);
      this.closeModal();
    });
  }  
}
