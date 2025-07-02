import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [],
  templateUrl: './deposito.html',
  styleUrl: './deposito.scss'
})
export class Deposito {
  @Input() deposito: any;

  constructor(@Inject(OverlayRef) private overlayRef: OverlayRef) {}

  closeModal() {
  console.log('Fechando modal...');
  this.overlayRef.dispose();
  }
}
