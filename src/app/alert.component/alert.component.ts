// alert.component.ts - ANIMAÇÕES FORA DA ZONA ANGULAR
import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  InjectionToken,
  OnDestroy,
  NgZone, // ✅ ADICIONAR
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

export interface AlertData {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export const ALERT_DATA = new InjectionToken<AlertData>('ALERT_DATA');

@Component({
  selector: 'app-alert.component',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent implements AfterViewInit, OnDestroy {
  @ViewChild('alertContainer') alertContainer!: ElementRef;
  private autoCloseTimeout: any;
  private isClosing = false;
  private isDestroyed = false;

  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  constructor(
    @Inject(ALERT_DATA) public data: AlertData,
    private overlayRef: OverlayRef,
    private zone: NgZone // ✅ ADICIONAR NgZone
  ) {}

  ngAfterViewInit(): void {
    try {
      if (this.alertContainer?.nativeElement && !this.isDestroyed) {
        // ✅ ANIMAÇÃO DE ENTRADA FORA DA ZONA ANGULAR
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            if (!this.isDestroyed && this.alertContainer?.nativeElement) {
              this.alertContainer.nativeElement.classList.add('open');
            }
          }, 150);
        });
      }

    } catch (error) {
      console.error('❌ Erro no ngAfterViewInit do alert:', error);
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  close(): void {
    if (this.isClosing || this.isDestroyed) return;
    this.isClosing = true;

    try {
      if (this.autoCloseTimeout) {
        clearTimeout(this.autoCloseTimeout);
      }

      // ✅ ANIMAÇÃO DE SAÍDA COMPLETAMENTE FORA DA ZONA ANGULAR
      this.zone.runOutsideAngular(() => {
        if (this.alertContainer?.nativeElement) {
          this.alertContainer.nativeElement.classList.add('closing');
          
          requestAnimationFrame(() => {
            if (!this.isDestroyed && this.alertContainer?.nativeElement) {
              this.alertContainer.nativeElement.classList.remove('open');
            }
          });
        }

        // ✅ DISPOSE TAMBÉM FORA DA ZONA
        setTimeout(() => {
          try {
            if (!this.isDestroyed && this.overlayRef && this.overlayRef.hasAttached()) {
              // ✅ DISPOSE DENTRO DA ZONA APENAS QUANDO NECESSÁRIO
              this.zone.run(() => {
                this.overlayRef.dispose();
              });
            }
          } catch (error) {
            console.warn('Erro ao fechar overlay:', error);
          }
        }, 420);
      });

    } catch (error) {
      console.error('❌ Erro ao fechar alert:', error);
      try {
        if (!this.isDestroyed) {
          this.overlayRef?.dispose();
        }
      } catch (disposeError) {
        console.warn('Erro ao forçar fechamento:', disposeError);
      }
    }
  }
}