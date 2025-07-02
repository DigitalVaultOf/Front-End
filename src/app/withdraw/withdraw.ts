import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './withdraw.html',
  styleUrls: ['./withdraw.scss'],
})
export class Withdraw {
  @Input() withdraw: any;

  constructor(@Inject(OverlayRef) private overlayRef: OverlayRef) {}

  closeModal() {
  console.log('Fechando modal...');
  this.overlayRef.dispose();
}

}
