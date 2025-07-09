import { CommonModule } from '@angular/common';
import {
  Component,
  Injector,
  OnInit,
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
import { interval, Subscription, switchMap } from 'rxjs';
import { User, UserI } from '../services/user';
import { Estrato, Movimentacao } from '../services/estrato';
import { ChangeDetectorRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSignOutAlt,
  faCog,
  faChevronRight,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { DeletarConta } from '../deletar-conta/deletar-conta';
import { UserService } from '../services/user.service';


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

  private overlayRef?: OverlayRef;
  updateSubscription!: Subscription;

  Transferencia = Transferencia;
  Deposito = Deposito;
  Withdraw = Withdraw;
  EditarConta = EditarConta;
  DeletarConta = DeletarConta;

  constructor(
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
    this.userService.GetUserById().subscribe({
      next: (usuario) => {
        this.usuarioLogado = usuario;
        this.loadAccount(); // Carrega os dados da conta
        this.history(); // Carrega o histórico de transações
        
        this.updateSubscription = interval(1000)
        .pipe(switchMap(() => this.user.getUser()))
        .subscribe({
          next: (response) => {
            this.accountData = response.data;
            this.cdr.detectChanges(); // Força a atualização da tela
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
        alert('Sua sessão expirou ou a conta é inválida. Por favor, faça o login novamente.');
        this.auth.logout(); // Garante que qualquer resquício de token seja limpo
        this.router.navigate(['/login']); // Força o redirecionamento para o login
      },
    });
  }
  
  ngOnDestroy(): void {
  if (this.updateSubscription) {
    this.updateSubscription.unsubscribe();
  }
}

  history() {
    this.extrato.getHistory().subscribe({
      next: (res) => {
        this.valores = res.data; // Atribui array de objetos à variável valores
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
    });}

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


  logout() {
    if (confirm('Deseja realmente sair?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  abrirModalExclusao() {
    if (!this.usuarioLogado || !this.usuarioLogado.accountNumber) {
      alert('Não foi possível obter os dados da conta para a exclusão.');
      return;
    }

    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const injector = this.createInjector(overlayRef);
    const portal = new ComponentPortal(DeletarConta, null, injector);
    const componentRef = overlayRef.attach(portal);

    componentRef.instance.accountNumber = this.usuarioLogado.accountNumber;
    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
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
    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().subscribe(() => this.closeModal());
  }

  closeModal() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
