import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  InjectionToken,
  OnDestroy,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { clear } from 'console';

export interface AlertData {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export const ALERT_DATA = new InjectionToken<AlertData>('ALERT_DATA');

@Component({
  selector: 'app-alert.component',
  standalone: true,
  imports: [CommonModule, NgClass, FontAwesomeModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent implements AfterViewInit, OnDestroy {
  @ViewChild('alertContainer') alertContainer!: ElementRef;
  private autoCloseTimeout: any;

  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  constructor(
    @Inject(ALERT_DATA) public data: AlertData,
    private overlayRef: OverlayRef
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.alertContainer.nativeElement.classList.add('open');
    }, 10);

    this.autoCloseTimeout = setTimeout(() => {
      this.close();
    }, 3000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.autoCloseTimeout);
  }

  close(): void {
    clearTimeout(this.autoCloseTimeout);
    this.alertContainer.nativeElement.classList.remove('open');
    setTimeout(() => {
      this.overlayRef.dispose();
    }, 300);
  }
}
