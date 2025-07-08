import { CommonModule } from '@angular/common';
import {
  Component,
  Injector,
  Type,
  HostListener,
  ElementRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Transferencia } from '../transferencia/transferencia';
import { Deposito } from '../deposito/deposito';
import { Withdraw } from '../withdraw/withdraw';
import { EditarConta } from '../editar-conta/editar-conta'; 
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Auth } from '../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOutAlt, faCog, faChevronRight, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    OverlayModule,
    PortalModule,
    FontAwesomeModule,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  protected title = 'Front-End-Net';
  showContent = true;
  isDropdownOpen = false;

  faSignOutAlt = faSignOutAlt;
  faCog = faCog;
  faChevronRight = faChevronRight;
  faEdit = faEdit;
  faTrash = faTrash;
 
  private overlayRef?: OverlayRef;

  Transferencia = Transferencia;
  Deposito = Deposito;
  Withdraw = Withdraw;
  EditarConta = EditarConta; 


  constructor(
    private overlay: Overlay,
    private router: Router,
    private auth: Auth,
    private el: ElementRef
  ) {}

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Impede que o clique se propague e feche o menu imediatamente
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    // Se o clique foi fora do elemento que contém o dropdown, feche-o
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  goTo(path: string) {
    this.showContent = false;
    this.router.navigate(['/home/', path]);
  }

  logout() {
    if (confirm('Deseja realmente sair?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  excluirConta() {
    if (confirm('Deseja realmente excluir sua conta?')) {
      
    }
  }

  openModal(component: Type<any>) {
    this.overlayRef?.dispose();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
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
