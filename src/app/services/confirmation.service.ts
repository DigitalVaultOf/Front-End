import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import {
  ConfirmationComponent,
  CONFIRMATION_DATA,
} from '../confirmation.component/confirmation.component'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  // Este é o método principal que você irá chamar
  show(
    title: string,
    message: string,
    type: 'warning' | 'error' | 'success' = 'warning' // 'warning' como padrão
    
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

    // 2. Cria um injetor customizado para passar os dados para o modal
    const customInjector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: CONFIRMATION_DATA,
          useValue: { type, title, message },
        },
        {provide: OverlayRef, useValue: overlayRef}
      ],
    });

    // 3. Cria um portal para o nosso componente de confirmação
    const portal = new ComponentPortal(
      ConfirmationComponent,
      null,
      customInjector
    );

    // 4. Anexa o nosso componente ao contêiner do overlay
    const componentRef = overlayRef.attach(portal);

    // 5. Lida com o clique fora do modal para fechá-lo (retornando 'false')
    overlayRef.backdropClick().subscribe(() => {
      componentRef.instance.close(false);
    });

    // 6. Retorna o observable 'onClose' do nosso componente.
    // É aqui que receberemos a resposta 'true' ou 'false'.
    return componentRef.instance.onClose;
  }
}
