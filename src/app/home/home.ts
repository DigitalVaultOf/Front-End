import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Injector,
  OnInit,
  OnDestroy,
  Type,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, NavigationStart, RouterOutlet } from '@angular/router';
import { Transferencia } from '../transferencia/transferencia';
import { Deposito } from '../deposito/deposito';
import { Withdraw } from '../withdraw/withdraw';
import { Pix } from '../pix/pix';
import { Payment } from '../payment/payment';
import { EditarConta } from '../editar-conta/editar-conta';
import { DeletarConta } from '../deletar-conta/deletar-conta';
import { Export } from '../export/export';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User, UserI } from '../services/user';
import { Estrato, Movimentacao, MovimentHistoryDto } from '../services/estrato';
import { AlertService } from '../services/alert.service';
import { ConfirmationService } from '../services/confirmation.service';
import { OverlayManagerService } from '../services/overlay-manager.service';
import { AiChatbot } from '../ai/ai';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSignOutAlt,
  faCog,
  faChevronRight,
  faEdit,
  faTrash,
  faChevronDown,
  faChevronLeft,
  faExchangeAlt,
  faDownload,
  faCashRegister,
  faQrcode,
  faFileInvoiceDollar,
  faBarcode,
  faFileInvoice,
  faArrowDown,
  faArrowUp,
  faEye,
  faHandHoldingDollar,
  faMoneyBillTransfer 
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faPix,  } from '@fortawesome/free-brands-svg-icons';


import { filter, interval, Subscription, switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    OverlayModule,
    PortalModule,
    FontAwesomeModule,
    AiChatbot,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit, OnDestroy {
  private tokenCheckInterval: any;
  private hasShownExpirationWarning = false;
  private overlayRef?: OverlayRef;
  updateSubscription!: Subscription;
  private boundOnBrowserBack = this.onBrowserBack.bind(this);

  // Dados da conta
  usuarioLogado: any;
  accountData: UserI['data'] | null = null;
  message: string = '';
  error: string = '';
  showContent = true;
  carregandoTransacoes = false;

  // Ícones
  faGithub = faGithub;
  faOlho = faEye;
  faTransfer = faMoneyBillTransfer ;
  faDeposit = faArrowDown;
  faWithdraw = faHandHoldingDollar   ;
  faPix = faPix;
  faBoleto = faBarcode ;
  faSignOutAlt = faSignOutAlt;
  faCog = faCog;
  faChevronRight = faChevronRight;
  faEdit = faEdit;
  faTrash = faTrash;
  faChevronDown = faChevronDown;
  faChevronLeft = faChevronLeft;

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalItens: number = 0;
  totalPaginas: number = 0;
  valores: Movimentacao[] = [];
  movimentacoes: MovimentHistoryDto[] = [];

  // Dropdown
  isDropdownOpen = false;
  menuOpen = false;
  Math = Math;

  // Modais
  Transferencia = Transferencia;
  Deposito = Deposito;
  Withdraw = Withdraw;
  Pix = Pix;
  Payment = Payment;
  EditarConta = EditarConta;
  DeletarConta = DeletarConta;
  Export = Export;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private alertService: AlertService,
    private overlay: Overlay,
    private router: Router,
    private userService: UserService,
    private user: User,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private extrato: Estrato,
    private overlayManager: OverlayManagerService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        if (this.overlayRef) {
          this.overlayRef.dispose();
          this.overlayRef = undefined;
        }
      });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }

      this.startTokenCheck();
      this.inicializarPaginacao();

      // ✅ Carregar usuário + conta ao mesmo tempo
      forkJoin({
        usuario: this.userService.GetUserById(),
        conta: this.user.getUser(),
      }).subscribe({
        next: ({ usuario, conta }) => {
          this.usuarioLogado = usuario;
          this.accountData = conta.data;
          this.message = conta.message;

          this.history();
          this.carregarMovimentacoes();

          this.updateSubscription = interval(1000)
            .pipe(switchMap(() => this.user.getUser()))
            .subscribe({
              next: (response) => {
                this.accountData = response.data;
                this.cdr.detectChanges();
              },
              error: (err) => {
                if (err.status === 401 || err.status === 403) {
                  this.stopTokenCheck();
                }
              },
            });
        },
        error: (err) => {
          this.alertService.showWarning(
            'Sessão Expirada!',
            'Sua sessão expirou ou a conta é inválida. Faça o login novamente.'
          );
          this.authService.logout();
          this.router.navigate(['/login']);
        },
      });

      window.addEventListener('popstate', this.boundOnBrowserBack);
    }
  }

  ngOnDestroy(): void {
    this.stopTokenCheck();
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
    this.overlayManager.closeAllOverlays('componente destruído');

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('popstate', this.boundOnBrowserBack);
    }
  }

  private startTokenCheck(): void {
    this.tokenCheckInterval = setInterval(() => {
      if (!this.authService.isLoggedIn()) {
        this.stopTokenCheck();
        return;
      }

      if (
        this.authService.isTokenExpiringSoon() &&
        !this.hasShownExpirationWarning
      ) {
        this.hasShownExpirationWarning = true;
        this.alertService.showWarning(
          'Sessão Expirando',
          'Sua sessão expirará em breve...'
        );
        setTimeout(() => {
          this.hasShownExpirationWarning = false;
        }, 120000);
      }
    }, 30000);
  }

  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  inicializarPaginacao(): void {
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
    this.totalItens = 0;
    this.totalPaginas = 0;
    this.carregandoTransacoes = false;
    this.valores = [];
  }

  history() {
    this.extrato.getHistory().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.valores = res.data;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) return;
      },
    });
  }

  carregarMovimentacoes() {
    this.carregandoTransacoes = true;
    this.extrato
      .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.movimentacoes = res.data.pages;
            this.totalItens = res.data.totalCount;
            this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
            this.carregandoTransacoes = false;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) return;
          setTimeout(() => {
            this.carregandoTransacoes = false;
            this.cdr.detectChanges();
          }, 0);
        },
      });
  }

  carregarMovimentacoesSemana() {
    this.extrato.getMovimentacoesUltimaSemana().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.valores = res.data;
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  carregarMovimentacoesMes() {
    this.extrato.carregarMovimentacoesMes().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.valores = res.data;
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
      this.paginaAtual = pagina;
      this.carregarMovimentacoes();
    }
  }

  irParaProximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.carregarMovimentacoes();
    }
  }

  irParaPaginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.carregarMovimentacoes();
    }
  }
get saldoFormatado(): string {
  const valor = this.accountData?.balance ?? 0;
  const valorFormatado = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumIntegerDigits: 2, // força 2 dígitos antes da vírgula
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return valorFormatado.replace('R$', 'R$');
}
  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
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
    this.confirmationService
      .show('Confirmação de Logout', 'Você tem certeza que deseja sair?')
      .subscribe((result) => {
        if (result) {
          this.stopTokenCheck();
          this.authService.logout();
          this.alertService.showSuccess('Sucesso!', 'Logout realizado com sucesso!');
          this.router.navigate(['/login']);
        }
      });
  }

  get primeiroNome(): string {
  const nomeCompleto = this.accountData?.name;
  if (!nomeCompleto) return 'Usuário';
  return nomeCompleto.split(' ')[0];
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
        'Você tem certeza? Esta ação é irreversível.',
        'error'
      )
      .subscribe((result) => {
        if (result) {
          this.userService.DeleteUser(this.usuarioLogado.accountNumber).subscribe({
            next: (sucesso) => {
              if (sucesso) {
                this.alertService.showSuccess(
                  'Sucesso!',
                  'Conta desativada. Você será desconectado...'
                );
                this.stopTokenCheck();
                setTimeout(() => {
                  this.authService.logout();
                  this.router.navigate(['/login']);
                }, 2000);
              }
            },
          });
        }
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

    this.overlayManager.registerOverlay(this.overlayRef, component.name);
    const injector = Injector.create({
      providers: [{ provide: OverlayRef, useValue: this.overlayRef }],
    });

    const portal = new ComponentPortal(component, null, injector);
    const componentRef = this.overlayRef.attach(portal);

    (componentRef.instance as any).onReloadTable = () => {
      this.carregarMovimentacoes();
      this.history();
    };

    this.overlayRef
      .backdropClick()
      .subscribe(() => componentRef.instance.closeModal());
  }

  closeModal() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  private onBrowserBack(event: PopStateEvent): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
