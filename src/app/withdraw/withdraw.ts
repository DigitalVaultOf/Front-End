import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './withdraw.html',
  styleUrls: ['./withdraw.scss'],
})
export class Withdraw {
  @Input() withdraw: any;
}
