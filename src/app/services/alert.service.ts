import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  AlertComponent,
  AlertData,
  ALERT_DATA,
} from '../alert.component/alert.component';
import { OverlayManagerService } from './overlay-manager.service'; // ✅ 1. ADICIONAR IMPORT

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private overlay: Overlay, 
    private injector: Injector,
    private overlayManager: OverlayManagerService // ✅ 2. INJETAR O SERVIÇO
  ) {}

  show(data: AlertData): void {
    const overlayRef = this.overlay.create({});

    // ✅ 3. REGISTRAR O ALERT NO OVERLAY MANAGER
    this.overlayManager.registerAlert(overlayRef, `AlertService-${data.type}`);

    const customInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ALERT_DATA, useValue: data },
        { provide: OverlayRef, useValue: overlayRef },
      ],
    });

    const portal = new ComponentPortal(AlertComponent, null, customInjector);
    overlayRef.attach(portal);
  }

  showSuccess(title: string, message: string) {
    this.show({
      type: 'success',
      title,
      message,
    });
  }
  
  showError(title: string, message: string) {
    this.show({
      type: 'error',
      title,
      message,
    });
  }
  
  showWarning(title: string, message: string) {
    this.show({
      type: 'warning',
      title,
      message,
    });
  }
}