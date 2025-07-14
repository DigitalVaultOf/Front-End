import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Injector,
  OnInit,
  Type,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Transferencia } from '../transferencia/transferencia';
import { Deposito } from '../deposito/deposito';
import { Withdraw } from '../withdraw/withdraw';
import { Pix } from '../pix/pix';
import { EditarConta } from '../editar-conta/editar-conta';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Auth } from '../services/auth';
import { interval, Subscription, switchMap } from 'rxjs';
import { User, UserI } from '../services/user';
import { Estrato, Movimentacao } from '../services/estrato';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSignOutAlt,
  faCog,
  faChevronRight,
  faEdit,
  faTrash,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { DeletarConta } from '../deletar-conta/deletar-conta';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service'; 
import { ConfirmationService } from '../services/confirmation.service';

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
export class Home implements OnInit {
  usuarioLogado: any;

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  valores: Movimentacao[] = [];
  accountData: UserI['data'] | null = null;
  message: string = '';
  error: string = '';
  protected title = 'Front-End-Net';
  showContent = true;
  isDropdownOpen = false;
  faSignOutAlt = faSignOutAlt;
  faCog = faCog;
  faChevronRight = faChevronRight;
  faEdit = faEdit;
  faTrash = faTrash;
  faChevronDown = faChevronDown;

  private overlayRef?: OverlayRef;
  updateSubscription!: Subscription;

  Transferencia = Transferencia;
  Deposito = Deposito;
  Withdraw = Withdraw;
  Pix = Pix;
  EditarConta = EditarConta;
  DeletarConta = DeletarConta;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private overlay: Overlay,
    private router: Router,
    private auth: Auth,
    private userService: UserService,
    private user: User,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private extrato: Estrato
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userService.GetUserById().subscribe({
        next: (usuario) => {
          this.usuarioLogado = usuario;
          this.loadAccount();
          this.history();

          this.updateSubscription = interval(1000)
            .pipe(switchMap(() => this.user.getUser()))
            .subscribe({
              next: (response) => {
                this.accountData = response.data;
                this.cdr.detectChanges();
                this.message = response.message;
              },
              error: (err) => {
                console.error('Erro ao atualizar os dados da conta.', err);
                this.error = 'Erro ao atualizar os dados.';
              },
            });
        },
        error: (err) => {
          console.error('Falha ao obter dados do usuário, deslogando.', err);

          this.alertService.showWarning(
            'Sessão Expirada!',
            'Sua sessão expirou ou a conta é inválida. Por favor, faça o login novamente.'
          );

          this.auth.logout();
          this.router.navigate(['/login']);
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  history() {
    this.extrato.getHistory().subscribe({
      next: (res) => {
        this.valores = res.data;
      },
      error: (err) => console.error('Erro ao carregar valores:', err),
    });
  }

  carregarMovimentacoesSemana() {
    this.extrato.getMovimentacoesUltimaSemana().subscribe({
      next: (res) => (this.valores = res.data),
      error: (err) => console.error('Erro ao carregar semana:', err),
    });
  }

  carregarMovimentacoesMes() {
    this.extrato.carregarMovimentacoesMes().subscribe({
      next: (res) => (this.valores = res.data),
      error: (err) => console.error('Erro ao carregar mês:', err),
    });
  }

  loadAccount() {
    this.user.getUser().subscribe({
      next: (response) => {
        this.accountData = response.data;
        this.message = response.message;
      },
    });
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  logout() {
    const title = 'Confirmação de Logout';
    const message = 'Você tem certeza que deseja sair?';

    this.confirmationService.show(title, message).subscribe((result) => {
      if (result) {
        this.auth.logout();
        this.alertService.showSuccess(
          'Sucesso!',
          'Logout realizado com sucesso!'
        );
        this.router.navigate(['/login']);
      }
    });
  }

  abrirModalExclusao() {
    if (!this.usuarioLogado || !this.usuarioLogado.accountNumber) {
      if (isPlatformBrowser(this.platformId)) {
        this.alertService.showError(
          'Ops! Algo deu errado...',
          'Não foi possível identificar a conta para desativação.'
        );
      }
      return;
    }

    this.confirmationService
      .show(
        'Desativar Conta',
        'Você tem certeza? Esta ação é irreversível e sua conta será desativada permanentemente.',
        'error'
      )
      .subscribe((result) => {
        if (result) {
          this.userService
            .DeleteUser(this.usuarioLogado.accountNumber)
            .subscribe({
              next: (sucesso) => {
                if (sucesso) {
                  this.alertService.showSuccess(
                    'Sucesso!',
                    'Sua conta foi desativada. Você será desconectado em breve...'
                  );
                  setTimeout(() => {
                    this.auth.logout();
                    this.router.navigate(['/login']);
                  }, 2000);
                }
              },
              error: (err) => {
                this.alertService.showError(
                  'Ops! Algo deu errado...',
                  err.error?.message || 'Não foi possível desativar a conta.'
                );
              },
            });
        }
      });
  }

  private createInjector(overlayRef: OverlayRef): Injector {
    return Injector.create({
      providers: [{ provide: OverlayRef, useValue: overlayRef }],
    });
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
    const componentRef = this.overlayRef.attach(portal);
    this.overlayRef
      .backdropClick()
      .subscribe(() => componentRef.instance.closeModal());
  }

  closeModal() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
