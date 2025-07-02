import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Type } from '@angular/core';
import { Withdraw } from './withdraw/withdraw';

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
  
    const portal = new ComponentPortal(component);
    this.overlayRef.attach(portal);
  
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }
  

  

}
