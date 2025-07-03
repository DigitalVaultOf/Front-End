import { Component, Type, Injector } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Withdraw } from './withdraw/withdraw';
import { Deposito } from './deposito/deposito';
import { Transferencia } from './transferencia/transferencia';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, OverlayModule, PortalModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  showContent = true;
  private overlayRef?: OverlayRef;

  Withdraw = Withdraw;
  Deposito = Deposito;
  Transferencia = Transferencia;
  
  constructor(private overlay: Overlay, private router: Router) {}

  goTo(path: string) {
    this.showContent = false;
    this.router.navigate([path]);
  }

  openModal(component: Type<any>) {
    this.overlayRef?.dispose();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const injector = this.createInjector(this.overlayRef);
    const portal = new ComponentPortal(component, null, injector);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.closeModal());
  }

  closeModal() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  private createInjector(overlayRef: OverlayRef): Injector {
    return Injector.create({
      providers: [{ provide: OverlayRef, useValue: overlayRef }],
    });
  }
}
