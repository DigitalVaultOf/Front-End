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
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { Transferencia } from '../transferencia/transferencia';
import { Deposito } from '../deposito/deposito';
import { Withdraw } from '../withdraw/withdraw';
import { Pix } from '../pix/pix';
import { Payment } from '../payment/payment';
import { EditarConta } from '../editar-conta/editar-conta';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { AuthService } from '../services/auth.service';
import { interval, Subscription, switchMap } from 'rxjs';
import { User, UserI } from '../services/user';
import { Estrato, Movimentacao, MovimentHistoryDto } from '../services/estrato';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSignOutAlt,
  faCog,
  faChevronRight,
  faEdit,
  faTrash,
  faChevronDown,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { DeletarConta } from '../deletar-conta/deletar-conta';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { ConfirmationService } from '../services/confirmation.service';
import { Export } from '../export/export';

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
export class Home implements OnInit, OnDestroy {
  // ✅ NOVAS VARIÁVEIS PARA VERIFICAÇÃO DE TOKEN
  private tokenCheckInterval: any;
  private hasShownExpirationWarning = false; // Para evitar múltiplos avisos

  usuarioLogado: any;
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalItens: number = 0;
  totalPaginas: number = 0;
  valores: Movimentacao[] = [];
  movimentacoes: MovimentHistoryDto[] = [];
  accountData: UserI['data'] | null = null;
  message: string = '';
  Math = Math;
  error: string = '';
  protected title = 'Front-End-Net';
  showContent = true;
  isDropdownOpen = false;
  carregandoTransacoes = false;
  faSignOutAlt = faSignOutAlt;
  faCog = faCog;
  faChevronRight = faChevronRight;
  faEdit = faEdit;
  faTrash = faTrash;
  faChevronDown = faChevronDown;
  faChevronLeft = faChevronLeft;

  private overlayRef?: OverlayRef;
  updateSubscription!: Subscription;

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
    private authService: AuthService, // ✅ JÁ INJETADO
    private alertService: AlertService, // ✅ JÁ INJETADO
    private overlay: Overlay,
    private router: Router,
    private userService: UserService,
    private user: User,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private extrato: Estrato
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ VERIFICAÇÃO INICIAL DE LOGIN
      if (!this.authService.isLoggedIn()) {
        console.log('🚨 Usuário não está logado ou token expirado');
        this.router.navigate(['/login']);
        return;
      }

      // ✅ INICIAR VERIFICAÇÃO PERIÓDICA DE TOKEN
      this.startTokenCheck();

      this.inicializarPaginacao();

      this.userService.GetUserById().subscribe({
        next: (usuario) => {
          this.usuarioLogado = usuario;
          this.loadAccount(); // Carrega os dados da conta
          this.history(); // Carrega o histórico de transações automaticamente
          this.carregarMovimentacoes();

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
                
                // ✅ VERIFICAR SE É ERRO DE TOKEN EXPIRADO
                if (err.status === 401 || err.status === 403) {
                  console.log('🚨 Token expirado detectado na atualização de dados');
                  // O interceptor já vai tratar, mas vamos garantir
                  this.stopTokenCheck();
                }
              },
            });
        },
        error: (err) => {
          console.error('Falha ao obter dados do usuário, deslogando.', err);

          this.alertService.showWarning(
            'Sessão Expirada!',
            'Sua sessão expirou ou a conta é inválida. Por favor, faça o login novamente.'
          );

          this.authService.logout();
          this.router.navigate(['/login']);
        },
      });
    }
  }

  ngOnDestroy(): void {
    // ✅ LIMPAR TODOS OS INTERVALS E SUBSCRIPTIONS
    this.stopTokenCheck();
    
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  // ✅ NOVO: INICIAR VERIFICAÇÃO PERIÓDICA DE TOKEN
  private startTokenCheck(): void {
    // Verificar token a cada 30 segundos
    this.tokenCheckInterval = setInterval(() => {
      if (!this.authService.isLoggedIn()) {
        console.log('🚨 Token expirado detectado na verificação periódica');
        this.stopTokenCheck();
        return;
      }

      // ✅ Avisar se token expira em 5 minutos (só uma vez)
      if (this.authService.isTokenExpiringSoon() && !this.hasShownExpirationWarning) {
        this.hasShownExpirationWarning = true;
        this.alertService.showWarning(
          'Sessão Expirando',
          'Sua sessão expirará em breve...'
        );
        
        // ✅ Reset do aviso após 2 minutos para poder avisar novamente se necessário
        setTimeout(() => {
          this.hasShownExpirationWarning = false;
        }, 120000); // 2 minutos
      }
    }, 30000); // 30 segundos

    console.log('✅ Verificação periódica de token iniciada');
  }

  // ✅ NOVO: PARAR VERIFICAÇÃO DE TOKEN
  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
      console.log('🛑 Verificação periódica de token parada');
    }
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
        console.error('Erro ao carregar valores:', err);
        
        // ✅ VERIFICAR SE É ERRO DE TOKEN
        if (err.status === 401 || err.status === 403) {
          console.log('🚨 Token expirado detectado no carregamento do histórico');
          return; // O interceptor já vai tratar
        }
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  carregarMovimentacoes() {
    this.carregandoTransacoes = true;
    this.extrato
      .getHistoryPaginated(this.paginaAtual, this.itensPorPagina)
      .subscribe({
        next: (res) => {
          console.log('respo', res);

          // ✅ USAR setTimeout PARA TODAS AS MUDANÇAS:
          setTimeout(() => {
            this.movimentacoes = res.data.pages;
            this.totalItens = res.data.totalCount;
            this.totalPaginas = Math.ceil(
              this.totalItens / this.itensPorPagina
            );
            this.carregandoTransacoes = false;

            console.log('totalItens:', this.totalItens);
            console.log('itensPorPagina:', this.itensPorPagina);
            console.log('totalPaginas:', this.totalPaginas);
            console.log(
              'Paginação visível (totalPaginas > 1):',
              this.totalPaginas > 1
            );

            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error('Erro ao carregar movimentações:', err);
          
          // ✅ VERIFICAR SE É ERRO DE TOKEN
          if (err.status === 401 || err.status === 403) {
            console.log('🚨 Token expirado detectado no carregamento de movimentações');
            return; // O interceptor já vai tratar
          }
          
          // ✅ USAR setTimeout TAMBÉM NO ERRO:
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
      error: (err) => {
        console.error('Erro ao carregar semana:', err);
        
        // ✅ VERIFICAR SE É ERRO DE TOKEN
        if (err.status === 401 || err.status === 403) {
          console.log('🚨 Token expirado detectado no carregamento da semana');
          return;
        }
        
        setTimeout(() => {
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
      error: (err) => {
        console.error('Erro ao carregar mês:', err);
        
        // ✅ VERIFICAR SE É ERRO DE TOKEN
        if (err.status === 401 || err.status === 403) {
          console.log('🚨 Token expirado detectado no carregamento do mês');
          return;
        }
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  loadAccount() {
    this.user.getUser().subscribe({
      next: (response) => {
        this.accountData = response.data;
        this.message = response.message;
        console.log('Dados da conta carregados:', this.accountData);
      },
      error: (err) => {
        console.error('Erro ao carregar dados da conta:', err);
        
        // ✅ VERIFICAR SE É ERRO DE TOKEN
        if (err.status === 401 || err.status === 403) {
          console.log('🚨 Token expirado detectado no carregamento da conta');
          // O interceptor já vai tratar
        }
      }
    });
  }

  inicializarPaginacao(): void {
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
    this.totalItens = 0;
    this.totalPaginas = 0;
    this.carregandoTransacoes = false;
    this.valores = [];
  }

  irParaPagina(pagina: number): void {
    if (
      pagina >= 1 ||
      (pagina <= this.totalPaginas && pagina !== this.paginaAtual)
    ) {
      this.paginaAtual = pagina;
      this.carregarMovimentacoes();
      return; // Evita navegar para páginas inválidas
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

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

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
    const title = 'Confirmação de Logout';
    const message = 'Você tem certeza que deseja sair?';

    this.confirmationService.show(title, message).subscribe((result) => {
      if (result) {
        // ✅ PARAR VERIFICAÇÃO DE TOKEN ANTES DO LOGOUT
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
                  
                  // ✅ PARAR VERIFICAÇÃO DE TOKEN ANTES DO LOGOUT
                  this.stopTokenCheck();
                  
                  setTimeout(() => {
                    this.authService.logout();
                    this.router.navigate(['/login']);
                  }, 2000);
                }
              },
              error: (err) => {
                // ✅ VERIFICAR SE É ERRO DE TOKEN
                if (err.status === 401 || err.status === 403) {
                  console.log('🚨 Token expirado detectado na exclusão da conta');
                  return; // O interceptor já vai tratar
                }
                
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
}