import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-transferencia',
  imports: [],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.scss'
})
export class Transferencia {
  @Input() transferencia: any;

  constructor(@Inject(OverlayRef) private overlayRef: OverlayRef) {}

  closeModal() {
  console.log('Fechando modal...');
  this.overlayRef.dispose();
}
}
