import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import {
  ConfirmationComponent,
  CONFIRMATION_DATA,
} from '../confirmation.component/confirmation.component';
import { OverlayManagerService } from './overlay-manager.service'; // ✅ ADICIONAR IMPORT

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private overlayManager: OverlayManagerService // ✅ INJETAR O SERVIÇO
  ) {}

  show(
    title: string,
    message: string,
    type: 'warning' | 'error' | 'success' = 'warning'
  ): Observable<boolean> {
    // 1. Cria o contêiner do overlay (a "janela" flutuante)
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    // ✅ 2. REGISTRAR O OVERLAY NO SERVIÇO DE GERENCIAMENTO
    this.overlayManager.registerOverlay(
      overlayRef,
      `ConfirmationService-${type}`
    );

    // 3. Cria um injetor customizado para passar os dados para o modal
    const customInjector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: CONFIRMATION_DATA,
          useValue: { type, title, message },
        },
        { provide: OverlayRef, useValue: overlayRef },
      ],
    });

    // 4. Cria um portal para o nosso componente de confirmação
    const portal = new ComponentPortal(
      ConfirmationComponent,
      null,
      customInjector
    );

    // 5. Anexa o nosso componente ao contêiner do overlay
    const componentRef = overlayRef.attach(portal);

    // 6. Lida com o clique fora do modal para fechá-lo (retornando 'false')
    overlayRef.backdropClick().subscribe(() => {
      componentRef.instance.close(false);
    });

    // 7. Retorna o observable 'onClose' do nosso componente.
    return componentRef.instance.onClose;
  }
}
