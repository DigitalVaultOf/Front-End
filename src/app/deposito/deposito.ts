import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, Input } from '@angular/core';
import { Deposit } from '../services/deposit';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './deposito.html',
  styleUrl: './deposito.scss'
})
export class Deposito {
  @Input() deposito: any;
  valorDeposito: number = 0;

  constructor(@Inject(OverlayRef) private overlayRef: OverlayRef, private depositService: Deposit) {}

  closeModal() {
  console.log('Fechando modal...');
  this.overlayRef.dispose();
  }

  confirmarDeposito(){
    this.depositService.deposit(this.valorDeposito).subscribe({
      next: (res) => {
        console.log('deposito feito com sucesso');
        this.closeModal();
      },
      error: (err) => {
        console.log('erro ao fazer deposito: ',err)
      }
    })
  }
}
