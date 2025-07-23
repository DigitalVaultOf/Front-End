// home.ts - VERSÃO COMPLETA CORRIGIDA
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
  ViewChild,
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
  faFileExport,
  faFileInvoiceDollar,
  faBarcode,
  faFileInvoice,
  faArrowDown,
  faArrowUp,
  faEye,
  faEyeSlash,
  faHandHoldingDollar,
  faMoneyBillTransfer,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faPix } from '@fortawesome/free-brands-svg-icons';
import { NgZone } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Home implements OnInit, OnDestroy {
  // ✅ VIEWCHILD PARA DROPDOWN
  @ViewChild('dropdownToggle', { static: false }) dropdownToggle!: ElementRef;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu!: ElementRef;

  // ✅ PROPRIEDADES DE CONTROLE
  private isUpdatingData = false;
  private isUpdatingBalance = false;
  private lastKnownBalance = 0;
  private _cachedSaldo: string = 'R$ 0,00';
  private _lastBalance: number = -1;

  private tokenCheckInterval: any;
  private hasShownExpirationWarning = false;
  private overlayRef?: OverlayRef;
  updateSubscription!: Subscription;
  private boundOnBrowserBack = this.onBrowserBack.bind(this);
  private boundOnResize = this.onWindowResize.bind(this); // ✅ LISTENER DE RESIZE
  private boundOnScroll = this.onWindowScroll.bind(this); // ✅ LISTENER DE SCROLL
  private scrollTimeout: any; // ✅ TIMEOUT PARA SCROLL

  // Dados da conta
  saldoVisivel: boolean = this.getPreferenciaSaldo();
  contaVisivel: boolean = this.getPreferenciaConta();
  usuarioLogado: any;
  accountData: UserI['data'] | null = null;
  message: string = '';
  error: string = '';
  showContent = true;
  carregandoTransacoes = false;
  historicoExpandido = false;

  // Ícones
  faFileExport = faFileExport;
  faGithub = faGithub;
  faOlho = faEye;
  faOlhoFechado = faEyeSlash;
  faTransfer = faMoneyBillTransfer;
  faArrowDown = faArrowDown;
  faDeposit = faArrowDown;
  faWithdraw = faHandHoldingDollar;
  faPix = faPix;
  faBoleto = faBarcode;
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
    private zone: NgZone,
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

  // ✅ MÉTODOS DE PREFERÊNCIAS
  private getPreferenciaSaldo(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const preferencia = localStorage.getItem('saldoVisivel');
      return preferencia === 'true';
    }
    return false; // Padrão: oculto
  }

  private getPreferenciaConta(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const preferencia = localStorage.getItem('contaVisivel');
      return preferencia === 'true';
    }
    return false; // Padrão: oculto
  }

  private salvarPreferenciaSaldo(visivel: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('saldoVisivel', visivel.toString());
    }
  }

  private salvarPreferenciaConta(visivel: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('contaVisivel', visivel.toString());
    }
  }

  // ✅ MÉTODOS DE VISIBILIDADE
  toggleSaldoVisibilidade(): void {
    this.saldoVisivel = !this.saldoVisivel;
    this.salvarPreferenciaSaldo(this.saldoVisivel);
    console.log('👁️ Saldo visível:', this.saldoVisivel);

    if (this.saldoVisivel) {
      this.autoOcultarSaldo();
    }
  }

  toggleHistorico(): void {
    this.historicoExpandido = !this.historicoExpandido;
  }

  toggleContaVisibilidade(): void {
    this.contaVisivel = !this.contaVisivel;
    this.salvarPreferenciaConta(this.contaVisivel);
    console.log('🏦 Conta visível:', this.contaVisivel);

    if (this.contaVisivel) {
      this.autoOcultarConta();
    }
  }

  // ✅ AUTO-OCULTAR POR SEGURANÇA
  private saldoAutoOcultarTimeout: any;
  private contaAutoOcultarTimeout: any;

  private autoOcultarSaldo(): void {
    if (this.saldoAutoOcultarTimeout) {
      clearTimeout(this.saldoAutoOcultarTimeout);
    }

    this.saldoAutoOcultarTimeout = setTimeout(() => {
      if (this.saldoVisivel) {
        this.saldoVisivel = false;
        this.salvarPreferenciaSaldo(false);
        console.log('🔒 Saldo auto-ocultado por segurança');
        this.cdr.detectChanges();
      }
    }, 15000);
  }

  private autoOcultarConta(): void {
    if (this.contaAutoOcultarTimeout) {
      clearTimeout(this.contaAutoOcultarTimeout);
    }

    this.contaAutoOcultarTimeout = setTimeout(() => {
      if (this.contaVisivel) {
        this.contaVisivel = false;
        this.salvarPreferenciaConta(false);
        console.log('🔒 Conta auto-ocultada por segurança');
        this.cdr.detectChanges();
      }
    }, 15000);
  }

  // ✅ DROPDOWN COM POSICIONAMENTO E RESIZE
  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      setTimeout(() => {
        this.positionDropdown();
      }, 0);

      // Adiciona proteção extra durante scroll após abrir
      window.addEventListener('scroll', this.boundOnScroll, { passive: true });
    }
  }

  // ✅ MÉTODO PARA REDIMENSIONAMENTO DA TELA
  private onWindowResize(): void {
    if (this.isDropdownOpen) {
      // ✅ Reposicionar dropdown automaticamente ao redimensionar
      setTimeout(() => {
        this.positionDropdown();
      }, 10);
    }
  }

  // ✅ MÉTODO PARA SCROLL - FECHAR DROPDOWN COM DELAY
  private onWindowScroll(): void {
    if (this.isDropdownOpen) {
      if (this.scrollTimeout) cancelAnimationFrame(this.scrollTimeout);
      this.scrollTimeout = requestAnimationFrame(() => {
        this.reposicionarDropdownDuranteScroll();
      });
    }
  }

  private reposicionarDropdownDuranteScroll(): void {
    if (!this.dropdownToggle || !this.dropdownMenu) return;

    const button = this.dropdownToggle.nativeElement;
    const dropdown = this.dropdownMenu.nativeElement;
    const buttonRect = button.getBoundingClientRect();

    const isMobile = window.innerWidth < 768;
    const dropdownWidth = 200;
    const gap = 8;

    let top = buttonRect.bottom + gap;
    let left: number;

    if (isMobile) {
      left = buttonRect.right - dropdownWidth;
    } else {
      left = buttonRect.left;
    }

    left = Math.max(10, Math.min(left, window.innerWidth - dropdownWidth - 10));

    // Se não couber embaixo, sobe
    if (top + 200 > window.innerHeight) {
      top = buttonRect.top - 200 - gap;
    }

    dropdown.style.position = 'fixed';
    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
    dropdown.style.width = `${dropdownWidth}px`;
  }

  private positionDropdown(): void {
    if (!this.dropdownToggle || !this.dropdownMenu) return;

    const button = this.dropdownToggle.nativeElement;
    const dropdown = this.dropdownMenu.nativeElement;
    const buttonRect = button.getBoundingClientRect();

    const isMobile = window.innerWidth < 768;
    const dropdownWidth = 200;
    const gap = 8;

    let top = buttonRect.bottom + gap;
    let left: number;

    if (isMobile) {
      // Mobile: pela direita do botão
      left = buttonRect.right - dropdownWidth;
    } else {
      // Desktop: pela esquerda do botão (como submenu)
      left = buttonRect.left;
    }

    // Garantir que não saia da tela
    left = Math.max(10, Math.min(left, window.innerWidth - dropdownWidth - 10));

    // Se não couber embaixo, colocar em cima
    if (top + 200 > window.innerHeight) {
      top = buttonRect.top - 200 - gap;
    }

    dropdown.style.position = 'fixed';
    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
    dropdown.style.width = `${dropdownWidth}px`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }

      this.startTokenCheck();
      this.inicializarPaginacao();

      forkJoin({
        usuario: this.userService.GetUserById(),
        conta: this.user.getUser(),
      }).subscribe({
        next: ({ usuario, conta }) => {
          console.log('🚀 Dados iniciais carregados:', { usuario, conta });

          this.usuarioLogado = usuario;
          this.accountData = conta.data;
          this.lastKnownBalance = conta.data?.balance ?? 0;
          this.message = conta.message;

          this.loadInitialData();
          this.setupDataUpdateInterval();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erro ao carregar dados iniciais:', err);
          this.alertService.showWarning(
            'Sessão Expirada!',
            'Sua sessão expirou ou a conta é inválida. Faça o login novamente.'
          );
          this.authService.logout();
          this.router.navigate(['/login']);
        },
      });

      window.addEventListener('popstate', this.boundOnBrowserBack);
      window.addEventListener('resize', this.boundOnResize); // ✅ LISTENER DE RESIZE
      window.addEventListener('scroll', this.boundOnScroll, { passive: true }); // ✅ LISTENER DE SCROLL
    }
  }

  ngOnDestroy(): void {
    this.stopTokenCheck();
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
    this.overlayManager.closeAllOverlays('componente destruído');

    if (this.saldoAutoOcultarTimeout) {
      clearTimeout(this.saldoAutoOcultarTimeout);
    }
    if (this.contaAutoOcultarTimeout) {
      clearTimeout(this.contaAutoOcultarTimeout);
    }
    if (this.scrollTimeout) cancelAnimationFrame(this.scrollTimeout);

    window.removeEventListener('scroll', this.boundOnScroll);

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('popstate', this.boundOnBrowserBack);
      window.removeEventListener('resize', this.boundOnResize); // ✅ REMOVER LISTENER DE RESIZE
      window.removeEventListener('scroll', this.boundOnScroll); // ✅ REMOVER LISTENER DE SCROLL
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

  private loadInitialData(): void {
    console.log('📊 Iniciando carregamento de dados...');

    this.extrato.getHistory().subscribe({
      next: (res) => {
        console.log('📈 Histórico carregado:', res.data?.length || 0, 'itens');
        this.valores = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erro ao carregar histórico:', err);
        if (err.status === 401 || err.status === 403) return;
      },
    });

    this.carregandoTransacoes = true;
    this.extrato
      .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
      .subscribe({
        next: (res) => {
          console.log(
            '📋 Movimentações carregadas:',
            res.data?.pages?.length || 0,
            'itens'
          );
          this.movimentacoes = res.data?.pages || [];
          this.totalItens = res.data?.totalCount || 0;
          this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
          this.carregandoTransacoes = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erro ao carregar movimentações:', err);
          if (err.status === 401 || err.status === 403) return;
          this.carregandoTransacoes = false;
          this.cdr.detectChanges();
        },
      });
  }

  private setupDataUpdateInterval(): void {
    this.updateSubscription = interval(2000)
      .pipe(switchMap(() => this.user.getUser()))
      .subscribe({
        next: (response) => {
          this.zone.runOutsideAngular(() => {
            const newBalance = response.data?.balance ?? 0;

            if (
              newBalance !== this.lastKnownBalance &&
              !this.isUpdatingBalance &&
              !this.isUpdatingData
            ) {
              setTimeout(() => {
                this.zone.run(() => {
                  this.accountData = response.data;
                  this.lastKnownBalance = newBalance;
                  this.cdr.markForCheck();
                });
              }, 100);
            }
          });
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            this.stopTokenCheck();
          }
        },
      });
  }

  history() {
    if (this.accountData) {
      this.zone.runOutsideAngular(() => {
        this.extrato.getHistory().subscribe({
          next: (res) => {
            this.zone.run(() => {
              this.valores = res.data || [];
              this.cdr.detectChanges();
            });
          },
          error: (err) => {
            if (err.status === 401 || err.status === 403) return;
          },
        });
      });
    } else {
      this.extrato.getHistory().subscribe({
        next: (res) => {
          this.valores = res.data || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) return;
        },
      });
    }
  }

  carregarMovimentacoes() {
    this.isUpdatingData = true;

    if (this.accountData) {
      this.zone.runOutsideAngular(() => {
        this.carregandoTransacoes = true;

        this.extrato
          .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
          .subscribe({
            next: (res) => {
              this.zone.run(() => {
                this.movimentacoes = res.data?.pages || [];
                this.totalItens = res.data?.totalCount || 0;
                this.totalPaginas = Math.ceil(
                  this.totalItens / this.itensPorPagina
                );
                this.carregandoTransacoes = false;

                setTimeout(() => {
                  this.isUpdatingData = false;
                }, 500);

                this.cdr.detectChanges();
              });
            },
            error: (err) => {
              if (err.status === 401 || err.status === 403) return;
              this.zone.run(() => {
                this.carregandoTransacoes = false;
                this.isUpdatingData = false;
              });
            },
          });
      });
    } else {
      this.carregandoTransacoes = true;

      this.extrato
        .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
        .subscribe({
          next: (res) => {
            this.movimentacoes = res.data?.pages || [];
            this.totalItens = res.data?.totalCount || 0;
            this.totalPaginas = Math.ceil(
              this.totalItens / this.itensPorPagina
            );
            this.carregandoTransacoes = false;

            setTimeout(() => {
              this.isUpdatingData = false;
            }, 500);

            this.cdr.detectChanges();
          },
          error: (err) => {
            if (err.status === 401 || err.status === 403) return;
            this.carregandoTransacoes = false;
            this.isUpdatingData = false;
            this.cdr.detectChanges();
          },
        });
    }
  }

  carregarMovimentacoesSemana() {
    this.zone.runOutsideAngular(() => {
      this.extrato.getMovimentacoesUltimaSemana().subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.valores = res.data;
          });
        },
      });
    });
  }

  carregarMovimentacoesMes() {
    this.zone.runOutsideAngular(() => {
      this.extrato.carregarMovimentacoesMes().subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.valores = res.data;
          });
        },
      });
    });
  }

  irParaPagina(pagina: number): void {
    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas &&
      pagina !== this.paginaAtual
    ) {
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

  // ✅ GETTERS
  get contaExibida(): string {
    const conta = this.accountData?.accountNumber;
    if (!conta) return 'Carregando...';

    if (this.contaVisivel) {
      return conta;
    } else {
      return `•••${conta.slice(-3)}`;
    }
  }

  get saldoExibido(): string {
    if (this.saldoVisivel) {
      return this.saldoFormatado;
    } else {
      return '••••';
    }
  }

  get saldoFormatado(): string {
    const valor = this.accountData?.balance ?? 0;

    if (this.isUpdatingBalance || this.isUpdatingData) {
      return this._cachedSaldo;
    }

    if (valor !== this._lastBalance) {
      console.log('💰 Atualizando saldo formatado:', {
        de: this._lastBalance,
        para: valor,
      });
      this._lastBalance = valor;
      this._cachedSaldo = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return this._cachedSaldo;
  }

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
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
          this.alertService.showSuccess(
            'Sucesso!',
            'Logout realizado com sucesso!'
          );
          this.router.navigate(['/login']);
        }
      });
  }

  get primeiroNome(): string {
    const nomeCompleto = this.accountData?.name;
    if (!nomeCompleto) {
      console.log('👤 Nome não carregado ainda, usando fallback');
      return 'Usuário';
    }
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
          this.userService
            .DeleteUser(this.usuarioLogado.accountNumber)
            .subscribe({
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

// home.ts - ATUALIZAR O MÉTODO openModal
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
  
  // ✅ CRIAR INJECTOR COM DADOS DAS MOVIMENTAÇÕES
  const injector = Injector.create({
    providers: [
      { provide: OverlayRef, useValue: this.overlayRef },
      // ✅ PASSAR DADOS PARA O EXPORT
      ...(component.name === 'Export' ? [
        { provide: 'movimentacoes', useValue: this.movimentacoes }
      ] : [])
    ],
  });

  const portal = new ComponentPortal(component, null, injector);
  const componentRef = this.overlayRef.attach(portal);

  (componentRef.instance as any).onReloadTable = () => {
    this.onTransactionComplete();
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

  onTransactionComplete(): void {
    console.log('💳 Transação concluída, atualizando dados imediatamente...');

    this.isUpdatingBalance = true;

    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        this.user.getUser().subscribe({
          next: (response) => {
            this.zone.run(() => {
              console.log('📊 Dados atualizados:', response.data?.balance);
              this.accountData = response.data;
              this.lastKnownBalance = response.data?.balance ?? 0;
              this.isUpdatingBalance = false;

              this.loadTransactionHistory();
              this.cdr.detectChanges();
            });
          },
          error: () => {
            this.isUpdatingBalance = false;
            console.error('❌ Erro ao atualizar dados após transação');
          },
        });
      });
    }, 200);
  }

  private loadTransactionHistory(): void {
    console.log('📈 Recarregando histórico de transações...');

    this.extrato.getHistory().subscribe({
      next: (res) => {
        this.valores = res.data || [];
        console.log(
          '✅ Histórico geral atualizado:',
          this.valores.length,
          'itens'
        );
      },
      error: (err) => {
        console.error('❌ Erro ao recarregar histórico:', err);
        if (err.status === 401 || err.status === 403) return;
      },
    });

    this.carregandoTransacoes = true;
    this.extrato
      .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
      .subscribe({
        next: (res) => {
          this.movimentacoes = res.data?.pages || [];
          this.totalItens = res.data?.totalCount || 0;
          this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
          this.carregandoTransacoes = false;

          console.log(
            '✅ Movimentações atualizadas:',
            this.movimentacoes.length,
            'itens'
          );
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erro ao recarregar movimentações:', err);
          if (err.status === 401 || err.status === 403) return;
          this.carregandoTransacoes = false;
          this.cdr.detectChanges();
        },
      });
  }
}
