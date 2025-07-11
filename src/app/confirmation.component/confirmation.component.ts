import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  InjectionToken,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';

export interface ConfirmationData {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export const CONFIRMATION_DATA = new InjectionToken<ConfirmationData>(
  'CONFIRMATION_DATA'
);

@Component({
  selector: 'app-confirmation', // Corrigido o seletor
  standalone: true,
  imports: [CommonModule, NgClass, FontAwesomeModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'], // Corrigido para styleUrls
})
export class ConfirmationComponent implements AfterViewInit {
  @ViewChild('modalContainer') modalContainer!: ElementRef;
  private readonly _onClose = new Subject<boolean>();
  // Observable público que outros podem "ouvir"
  public readonly onClose = this._onClose.asObservable();
  // Ícones disponíveis para o template
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  constructor(
    @Inject(CONFIRMATION_DATA) public data: ConfirmationData,
    private overlayRef: OverlayRef
  ) {}

  // Anima a entrada do modal
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.modalContainer.nativeElement.classList.add('open');
    }, 10);
  }

  // Anima a saída e fecha o modal com um resultado (true ou false)
  close(result: boolean): void {
    this._onClose.next(result);
    this._onClose.complete();
    this.modalContainer.nativeElement.classList.remove('open');
    setTimeout(() => {
      this.overlayRef.dispose();
    }, 300);
  }
}
