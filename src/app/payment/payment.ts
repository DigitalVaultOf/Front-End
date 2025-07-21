import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { PaymentService } from '../services/payment.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
})
export class Payment implements OnInit {
  @Input() isOpen = false;
  @Output() paymentSuccess = new EventEmitter<any>();
  @Input() payment: any;
  @Input() onReloadTable?: () => void;

  // ✅ VARIÁVEIS PARA LISTAS
  exibirListaPendentes = false;
  exibirListaPagos = false;
  boletosPendentes: any[] = [];
  boletosPagos: any[] = [];
  carregandoLista = false;
  mensagemLista: string = '';

  validandoBoleto = false; // Loading da validação automática
  debounceTimer: any = null; // Timer para debounce

  veioDoPagementRapido = false;
  senhaIncorreta = false;

  boletoValidado = false; // Se foi validado
  boletoValido = false; // Se é válido para pagamento
  mensagemValidacao: string = '';

  exibirGerarBoleto = false;
  valorGeracao: number = 500;
  descricaoGeracao: string = '';
  mensagemErroGeracao: string | null = null;

  mostrarSucessoGeracao = false;
  valorBoletoGerado: number = 0;
  timerSucesso: any = null;

  isLoading = false;
  numeroBoleto: string = '';
  valorBoleto: number = 0;
  senha: string = '';
  exibirValorParcial = false;
  valorPagamento: number = 0;
  valorMinimo: number = 10; // Valor mínimo definido como 10
  mensagemErroValor: string | null = null;
  mensagemErro: string | null = null;
  exibirSenha: boolean = false;

  constructor(
    private overlayRef: OverlayRef,
    private alertService: AlertService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  onSenhaChange() {
    setTimeout(() => {
      this.mensagemErro = null;
      this.senhaIncorreta = false;
      this.cdr.detectChanges();
    }, 0);
  }

  // ✅ MÉTODO 1 - DETECTAR MUDANÇAS NO INPUT:
  onBoletoChange() {
    console.log(
      '🔄 onBoletoChange chamado, numeroBoleto:',
      this.numeroBoleto,
      'length:',
      this.numeroBoleto.length
    );

    // Limpar timer anterior
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Limpar estados
    this.boletoValidado = false;
    this.boletoValido = false;
    this.mensagemValidacao = '';
    this.mensagemErro = null;

    // Se input vazio, não validar
    if (!this.numeroBoleto || this.numeroBoleto.length === 0) {
      console.log('❌ Input vazio, não validando');
      return;
    }

    // Se menos de 10 dígitos, não validar ainda
    if (this.numeroBoleto.length < 1) {
      console.log('⏳ Menos de 10 dígitos, não validando ainda');
      return;
    }
    console.log('✅ Iniciando timer de 50 segundos...');

    this.debounceTimer = setTimeout(() => {
      console.log('🚀 Timer executado! Chamando validarBoletoAutomatico()');
      this.validarBoletoAutomatico();
    }, 10);
  }

  private validarBoletoAutomatico() {
    console.log('🔄 Setando validandoBoleto = true');
    this.validandoBoleto = true;

    // 🔍 FORÇAR DETECÇÃO MÚLTIPLA
    this.cdr.detectChanges();
    this.cdr.markForCheck();

    console.log('🎨 Após setChanges - validandoBoleto =', this.validandoBoleto);

    // 🔍 VERIFICAR SE ELEMENTO EXISTE NO DOM
    setTimeout(() => {
      const elemento = document.querySelector('.validation-loading');
      const elementoProminente = document.querySelector(
        '.validation-loading-prominent'
      );
      console.log('🌐 Elemento no DOM:', {
        validationLoading: !!elemento,
        validationLoadingProminent: !!elementoProminente,
        elementoVisivel: elemento
          ? getComputedStyle(elemento).display
          : 'não encontrado',
        elementoProminenteVisivel: elementoProminente
          ? getComputedStyle(elementoProminente).display
          : 'não encontrado',
      });
    }, 100);

    this.paymentService.validarBoleto(this.numeroBoleto).subscribe({
      next: (res: any) => {
        console.log('✅ Resposta recebida, setando validandoBoleto = false');

        if (res?.data) {
          this.valorBoleto = res.data.amount;
          this.valorPagamento = this.valorBoleto;
          this.boletoValidado = true;
          this.mensagemValidacao = res.message || '';
          this.boletoValido = !res.data.isFullyPaid;
          this.validandoBoleto = false;

          console.log('✅ Boleto validado automaticamente:', {
            isFullyPaid: res.data.isFullyPaid,
            mensagem: res.message,
            validandoBoleto: this.validandoBoleto,
          });

          this.cdr.detectChanges();
        } else {
          this.boletoValidado = true;
          this.boletoValido = false;
          this.mensagemValidacao = 'Boleto não encontrado';
          this.validandoBoleto = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log('❌ Erro recebido, setando validandoBoleto = false');
        this.boletoValidado = true;
        this.boletoValido = false;
        this.mensagemValidacao = err.error?.message || 'Erro ao validar boleto';
        this.validandoBoleto = false;
        this.cdr.detectChanges();
      },
    });
  }

  onBoletoInput(event: any) {
    console.log('🔍 onBoletoInput chamado:', event.target.value);

    let value = event.target.value;

    // Remover tudo que não for número
    value = value.replace(/\D/g, '');

    // Limitar a 18 dígitos
    if (value.length > 18) {
      value = value.substring(0, 18);
    }

    console.log('✅ Valor filtrado:', value);

    // Atualizar o valor
    this.numeroBoleto = value;

    // ✅ FORÇAR DETECÇÃO DE MUDANÇAS:
    this.cdr.detectChanges();

    // ✅ FORÇAR ATUALIZAÇÃO DO INPUT:
    event.target.value = value;

    // Chamar validação automática
    this.onBoletoChange();
  }

  validarBoleto() {
    if (!this.numeroBoleto) {
      this.mensagemErro = 'Digite o número do boleto';
      return;
    }

    this.isLoading = true;
    // ✅ SÓ LIMPAR VALIDAÇÃO SE NÃO ESTIVER VALIDADO OU SE FOR UMA NOVA VALIDAÇÃO MANUAL
    if (!this.boletoValidado) {
      this.boletoValidado = false;
      this.boletoValido = false;
      this.mensagemValidacao = '';
    }

    this.paymentService.validarBoleto(this.numeroBoleto).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.valorBoleto = res.data.amount;
          this.valorPagamento = this.valorBoleto;

          console.log('✅ Boleto validado:', {
            isFullyPaid: res.data.isFullyPaid,
            mensagem: res.message,
          });

          setTimeout(() => {
            this.boletoValidado = true;
            this.mensagemValidacao = res.message || '';
            this.boletoValido = !res.data.isFullyPaid;
            this.mensagemErro = null;
            this.isLoading = false;

            this.cdr.detectChanges();
          }, 800);
        } else {
          this.handleError('Boleto não encontrado');
          setTimeout(() => {
            this.boletoValidado = false;
            this.boletoValido = false;
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 500);
        }
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Erro ao validar boleto');
        setTimeout(() => {
          this.boletoValidado = false;
          this.boletoValido = false;
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);
      },
    });
  }

  gerarBoleto() {
    setTimeout(() => {
      this.exibirGerarBoleto = true;
      this.mensagemErro = null;
      this.valorGeracao = 500;
      this.descricaoGeracao = '';
      this.mensagemErroGeracao = null;
      this.cdr.detectChanges();
    }, 0);
  }

  pagarBoleto() {
    // Limpar estados anteriores
    this.mensagemErro = null;
    this.boletoValidado = false;
    this.boletoValido = false;
    this.mensagemValidacao = '';

    // Se já tem número, validar automaticamente
    if (this.numeroBoleto && this.numeroBoleto.length > 0) {
      this.validarBoleto();
    } else {
      // Se não tem número, mostrar mensagem
      this.mensagemErro = 'Digite o número do boleto para pagar';
    }
  }

  // ✅ NOVO MÉTODO PARA PAGAMENTO RÁPIDO (SÓ PARA O BOTÃO PEQUENO):
  pagarRapidamente() {
    this.isLoading = true;
    this.mensagemErro = null;
    this.veioDoPagementRapido = true;

    console.log('🚀 Iniciando pagamento rápido...');

    this.paymentService.listarBoletosPendentes().subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          // ✅ ENCONTRAR O BOLETO MAIS NOVO:
          const boletoMaisNovo = res.data.reduce(
            (newest: any, current: any) => {
              const newestDate = new Date(
                newest.createdAt || newest.dateCreated || newest.date
              );
              const currentDate = new Date(
                current.createdAt || current.dateCreated || current.date
              );
              return currentDate > newestDate ? current : newest;
            }
          );

          setTimeout(() => {
            this.numeroBoleto =
              boletoMaisNovo.bankSlipNumber || boletoMaisNovo.number;
            this.valorBoleto = boletoMaisNovo.amount || boletoMaisNovo.value;
            this.valorPagamento = this.valorBoleto; // ✅ VALOR INTEGRAL

            // ✅ IR DIRETO PARA SENHA:
            this.exibirSenha = true;
            this.isLoading = false;

            this.alertService.showSuccess(
              'Boleto encontrado!',
              `Pagar R$ ${this.valorBoleto.toFixed(2)} do boleto mais recente`
            );

            this.cdr.detectChanges();
          }, 0);
        } else {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.showSuccess(
              'Eba! Nada por aqui...',
              'Você está em dia com os pagamentos!'
            );
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: (err) => {
        setTimeout(() => {
          this.isLoading = false;
          this.handleError(err.error?.message || 'Erro ao buscar boletos');
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  listarBoletosPendentes() {
    // ✅ ENVOLVER EM setTimeout PARA EVITAR ERRO
    setTimeout(() => {
      this.carregandoLista = true;
      this.exibirListaPendentes = true;
      this.mensagemLista = '';
      this.cdr.detectChanges();
    }, 0);

    this.paymentService.listarBoletosPendentes().subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this.boletosPendentes = res?.data || [];
          this.mensagemLista = res?.message || '';
          this.carregandoLista = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.boletosPendentes = [];
          this.mensagemLista = 'Erro ao carregar boletos pendentes';
          this.carregandoLista = false;
          this.handleError(err.error?.message || 'Erro ao listar boletos pendentes');
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  listarBoletosPagos() {
    // ✅ ENVOLVER EM setTimeout PARA EVITAR ERRO
    setTimeout(() => {
      this.carregandoLista = true;
      this.exibirListaPagos = true;
      this.mensagemLista = '';
      this.cdr.detectChanges();
    }, 0);

    this.paymentService.listarBoletosPagos().subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this.boletosPagos = res?.data || [];
          this.mensagemLista = res?.message || '';
          this.carregandoLista = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.boletosPagos = [];
          this.mensagemLista = 'Erro ao carregar boletos pagos';
          this.carregandoLista = false;
          this.handleError(err.error?.message || 'Erro ao listar boletos pagos');
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  // ✅ NOVO MÉTODO PARA PAGAR BOLETO DA LISTA
  pagarBoletoDaLista(boleto: any) {
    setTimeout(() => {
      // Preencher dados do boleto selecionado
      this.numeroBoleto = boleto.bankSlipNumber;
      this.valorBoleto = boleto.amount;
      this.valorPagamento = boleto.amount;

      // Fechar lista e ir para tela de valor
      this.exibirListaPendentes = false;
      this.exibirValorParcial = true;
      this.mensagemErro = null;
      this.cdr.detectChanges();
    }, 0);
  }

  // ✅ FORMATAR DATA BRASILEIRA COM HORÁRIO
formatarData(data: string): string {
  if (!data) return '-';

  const date = new Date(data);

  // Subtrai 3 horas (UTC-3)
  date.setHours(date.getHours() - 3);

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}



  // ✅ FORMATAR VALOR MONETÁRIO
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  validarValorPagamento() {
    let hasError = false;
    let errorMessage = null;

    if (this.valorPagamento > this.valorBoleto) {
      errorMessage = 'O valor não pode ser maior que o valor do boleto';
      hasError = true;
    } else if (this.valorPagamento < this.valorMinimo) {
      errorMessage = `O valor mínimo permitido é R$ ${this.valorMinimo}`;
      hasError = true;
    }

    // ✅ ENVOLVER EM setTimeout PARA MUDANÇAS DE ESTADO
    setTimeout(() => {
      this.mensagemErroValor = errorMessage;
      this.cdr.detectChanges();
    }, 0);

    return !hasError;
  }

  confirmarValor() {
    if (this.validarValorPagamento()) {
      setTimeout(() => {
        this.exibirValorParcial = false;
        this.exibirSenha = true;
        this.cdr.detectChanges();
      }, 0);
    }
  }

  confirmarPagamento() {
    if (!this.senha) {
      this.mensagemErro = 'Digite sua senha';
      return;
    }

    this.isLoading = true;
    const isFullyPayment = this.valorPagamento === this.valorBoleto;

    console.log('🔍 DEBUG PAGAMENTO:', {
      numeroBoleto: this.numeroBoleto,
      valorBoleto: this.valorBoleto,
      valorPagamento: this.valorPagamento,
      isFullyPayment: isFullyPayment,
      senha: '***',
    });

    if (isFullyPayment) {
      const dto = {
        bankSlipNumber: this.numeroBoleto,
        userPassword: this.senha,
      };
      this.paymentService.pagarBoleto(dto).subscribe({
        next: (res: any) => this.handlePaymentSuccess(res),
        error: (err) => this.handlePaymentError(err),
      });

      console.log('🔵 DTO INTEGRAL:', dto);
    } else {
      const dto = {
        bankSlipNumber: this.numeroBoleto,
        userPassword: this.senha,
        amountToPay: this.valorPagamento,
      };
      console.log('🟡 DTO PARCIAL:', dto);
      console.log('📊 TIPOS:', {
        bankSlipNumber: typeof this.numeroBoleto,
        amountToPay: typeof this.valorPagamento,
        valorPagamento: this.valorPagamento,
      });

      this.paymentService.pagarBoletoParcial(dto).subscribe({
        next: (res: any) => this.handlePaymentSuccess(res),
        error: (err) => this.handlePaymentError(err),
      });
    }
  }

  private handlePaymentSuccess(res: any) {
    setTimeout(() => {
      // ✅ ACEITAR res SEM data (para pagamento parcial):
      if (res?.data || res?.message) {
        this.mensagemErro = null;
        this.senhaIncorreta = false;

        // ✅ SEMPRE USAR MENSAGEM DA API:
        const mensagem = res.message || 'Pagamento realizado com sucesso!';

        this.alertService.showSuccess('Sucesso!', mensagem);
        this.onReloadTable?.();
        this.closeModal(); // ✅ SEMPRE FECHAR MODAL
      } else {
        this.handleError('Não foi possível realizar o pagamento');
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 0);
  }

  private handlePaymentError(err: any) {
    setTimeout(() => {
      // ✅ VERIFICAR SE É ERRO DE SENHA:
      const errorMessage = err.error?.message || 'Erro ao processar pagamento';
      this.senhaIncorreta =
        errorMessage.toLowerCase().includes('senha') ||
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('inválida') ||
        errorMessage.toLowerCase().includes('incorreta');

      this.handleError(errorMessage);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 0);
  }

  // ✅ MODIFICAÇÃO 2: Adicionar método para detectar tipo de mensagem
  getTipoMensagemValidacao(): string {
    if (!this.mensagemValidacao) return '';

    const mensagem = this.mensagemValidacao.toLowerCase();

    // ✅ DETECTAR MENSAGEM DE BOLETO JÁ PAGO
    if (
      mensagem.includes('já foi pago') ||
      mensagem.includes('already paid') ||
      mensagem.includes('anteriormente') ||
      mensagem.includes('pago anteriormente')
    ) {
      return 'already-paid'; // ✅ Classe especial para amarelo
    }

    // ✅ OUTRAS MENSAGENS MANTÊM A COR PADRÃO
    return this.boletoValido ? 'valid' : 'invalid';
  }

  getTextoBotaoPrincipal(): string {
    if (this.isLoading) {
      if (this.exibirGerarBoleto) return 'Gerando';
      if (this.mostrarSucessoGeracao) return 'Processando';

      if (!this.exibirValorParcial && !this.exibirSenha) return 'Validando';
      if (this.exibirValorParcial) return 'Confirmando';
      return 'Processando';
    }

    if (this.exibirGerarBoleto) return 'Gerar boleto';
    if (this.mostrarSucessoGeracao) return 'Pagar agora';

    if (!this.exibirValorParcial && !this.exibirSenha) {
      if (this.numeroBoleto && this.numeroBoleto.length > 0) {
        return 'Pagar agora';
      }
      return 'Pagar agora';
    }

    if (this.exibirValorParcial) return 'Confirmar valor';

    // ✅ NOVA LÓGICA PARA TELA DE SENHA:
    if (this.exibirSenha) {
      if (this.senhaIncorreta) {
        return 'Tentar novamente';
      }
      return 'Pagar boleto';
    }

    return 'Pagar boleto';
  }

  permitirAvancar(): boolean {
    if (this.isLoading) return false;

    if (this.exibirGerarBoleto) {
      return this.valorGeracao > 0 && this.descricaoGeracao.trim().length > 0;
    }

    // ✅ NOVA LÓGICA SIMPLIFICADA:
    if (!this.exibirValorParcial && !this.exibirSenha) {
      return !!this.numeroBoleto && this.numeroBoleto.length > 0;
    }

    if (this.exibirValorParcial) {
      return this.validarValorPagamento();
    }

    if (this.exibirSenha) {
      return !!this.senha;
    }

    return false;
  }

  avancarEtapa() {
    if (this.exibirGerarBoleto) {
      this.confirmarGeracao();
      return;
    }

    // ✅ NOVO: Se está na tela de sucesso, ir para valor
    if (this.mostrarSucessoGeracao) {
      setTimeout(() => {
        this.mostrarSucessoGeracao = false;
        this.exibirValorParcial = true;
        this.mensagemErro = null;
        this.cdr.detectChanges();
      }, 0);
      return;
    }

    if (!this.exibirValorParcial && !this.exibirSenha) {
      if (this.numeroBoleto && this.numeroBoleto.length > 0) {
        // ✅ SE BOLETO FOI GERADO (tem valorBoletoGerado), IR DIRETO PARA VALOR:
        if (this.valorBoletoGerado > 0) {
          setTimeout(() => {
            this.valorBoleto = this.valorBoletoGerado;
            this.valorPagamento = this.valorBoleto;
            this.exibirValorParcial = true;
            this.mensagemErro = null;
            this.cdr.detectChanges();
          }, 0);
        } else {
          // ✅ BOLETO DIGITADO MANUALMENTE → VERIFICAR STATUS:
          if (this.boletoValidado && this.boletoValido) {
            // ✅ JÁ VALIDADO E VÁLIDO → IR PARA VALOR:
            setTimeout(() => {
              this.exibirValorParcial = true;
              this.mensagemErro = null;
              this.cdr.detectChanges();
            }, 0);
          } else if (this.boletoValidado && !this.boletoValido) {
            // 🚨 JÁ VALIDADO MAS INVÁLIDO → MANTER MENSAGEM E NÃO AVANÇAR:
            console.log(
              '🚨 Boleto inválido, mantendo mensagem:',
              this.mensagemValidacao
            );
            this.mensagemErro = null; // Limpar erro genérico, manter mensagem de validação
            return; // ✅ NÃO AVANÇAR, MANTER MENSAGEM VISÍVEL
          } else {
            // ✅ NÃO VALIDADO → VALIDAR PRIMEIRO:
            this.validarBoleto();
          }
        }
      } else {
        this.mensagemErro = 'Digite o número do boleto';
      }
      return;
    }

    if (this.exibirValorParcial) {
      this.confirmarValor();
      return;
    }

    if (this.exibirSenha) {
      this.confirmarPagamento();
      return;
    }
  }

  validarGeracaoBoleto() {
    let hasError = false;

    if (this.valorGeracao <= 0) {
      this.mensagemErroGeracao = 'O valor deve ser maior que zero';
      hasError = true;
    } else if (this.descricaoGeracao.trim().length === 0) {
      this.mensagemErroGeracao = 'A descrição é obrigatória';
      hasError = true;
    } else if (this.descricaoGeracao.trim().length < 3) {
      this.mensagemErroGeracao = 'A descrição deve ter pelo menos 3 caracteres';
      hasError = true;
    } else {
      this.mensagemErroGeracao = null;
    }

    // ✅ ENVOLVER EM setTimeout SE HOUVE MUDANÇA
    if (hasError || this.mensagemErroGeracao === null) {
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }

    return !hasError;
  }

  copiarCodigoBoleto() {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(this.numeroBoleto)
        .then(() => {
          this.alertService.showSuccess(
            'Copiado!',
            'Código do boleto copiado para a área de transferência'
          );
        })
        .catch(() => {
          this.copiarFallback();
        });
    } else {
      this.copiarFallback();
    }
  }

  private copiarFallback() {
    const textArea = document.createElement('textarea');
    textArea.value = this.numeroBoleto;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.alertService.showSuccess(
        'Copiado!',
        'Código do boleto copiado para a área de transferência'
      );
    } catch (err) {
      this.alertService.showError(
        'Erro',
        'Não foi possível copiar automaticamente. Selecione e copie manualmente.'
      );
    }
    document.body.removeChild(textArea);
  }

  // ✅ VOLTAR PARA TELA DE PAGAMENTO:
  voltarParaPagamento() {
    setTimeout(() => {
      this.mostrarSucessoGeracao = false;
      this.cdr.detectChanges();
    }, 0);
  }

  // ✅ NOVO MÉTODO PARA TRANSIÇÃO LIMPA
  irParaTelaPagamento() {
    setTimeout(() => {
      // Sair da tela de sucesso e ir para valor
      this.mostrarSucessoGeracao = false;
      this.exibirValorParcial = true;
      this.mensagemErro = null;
      this.cdr.detectChanges();
    }, 0);
  }

  private verificarEValidarBoleto() {
    // Só validar se:
    // 1. Estamos na tela inicial
    // 2. Tem número no input
    // 3. Não está validado ainda
    const estaNaTelaInicial =
      !this.exibirValorParcial &&
      !this.exibirSenha &&
      !this.exibirGerarBoleto &&
      !this.mostrarSucessoGeracao &&
      !this.exibirListaPendentes &&
      !this.exibirListaPagos;

    if (
      estaNaTelaInicial &&
      this.numeroBoleto &&
      this.numeroBoleto.length > 0 &&
      !this.boletoValidado
    ) {
      console.log('🔄 Re-validando boleto automaticamente:', this.numeroBoleto);
      this.onBoletoChange();
    }
  }

  voltarTela() {
    setTimeout(() => {
      if (this.mostrarSucessoGeracao) {
        // ✅ VOLTANDO DA TELA DE SUCESSO → IR PARA TELA INICIAL
        this.mostrarSucessoGeracao = false;
        this.valorBoletoGerado = 0;

      } else if (this.exibirListaPendentes) {
        // ✅ NOVA: VOLTANDO DA LISTA PENDENTES
        this.exibirListaPendentes = false;
        this.boletosPendentes = [];
        this.carregandoLista = false;
        this.mensagemLista = '';

      } else if (this.exibirListaPagos) {
        // ✅ NOVA: VOLTANDO DA LISTA PAGOS
        this.exibirListaPagos = false;
        this.boletosPagos = [];
        this.carregandoLista = false;
        this.mensagemLista = '';

      } else if (this.exibirSenha) {
        if (this.veioDoPagementRapido) {
          // ✅ VOLTAR PARA TELA INICIAL (do pagamento rápido):
          this.exibirSenha = false;
          this.veioDoPagementRapido = false;
          this.senha = '';
          this.mensagemErro = null;
          this.senhaIncorreta = false;
        } else {
          // ✅ FLUXO NORMAL: SENHA → VALOR
          this.exibirSenha = false;
          this.exibirValorParcial = true;
          this.senha = '';
          this.mensagemErro = null;
          this.senhaIncorreta = false;
        }

      } else if (this.exibirValorParcial) {
        // ✅ VOLTANDO DA TELA DE VALOR → VERIFICAR DE ONDE VEIO
        this.exibirValorParcial = false;
        this.mensagemErroValor = null;
        this.mensagemErro = null;

        if (this.valorBoletoGerado > 0) {
          // ✅ VEIO DO SUCESSO → VOLTAR PARA SUCESSO
          this.mostrarSucessoGeracao = true;
          console.log('✅ Voltando da tela de valor para sucesso');
        } else {
          // ✅ VEIO DA TELA INICIAL → VOLTAR PARA INICIAL (preservar validação)
          console.log('✅ Voltando da tela de valor para inicial, preservando validação:', {
            boletoValidado: this.boletoValidado,
            boletoValido: this.boletoValido,
            mensagemValidacao: this.mensagemValidacao,
          });
        }

      } else if (this.exibirGerarBoleto) {
        // ✅ VOLTANDO DA TELA DE GERAR → IR PARA TELA INICIAL
        this.exibirGerarBoleto = false;
        this.mensagemErroGeracao = null;
      }

      this.cdr.detectChanges();

      // ✅ NOVA VERIFICAÇÃO: Re-validar boleto se necessário
      setTimeout(() => {
        this.verificarEValidarBoleto();
      }, 100);
    }, 0);
  }

  // ✅ MÉTODO PARA VERIFICAR SE DEVE MOSTRAR BOTÃO VOLTAR:
  mostrarBotaoVoltar(): boolean {
    return (
      this.exibirGerarBoleto ||
      this.exibirValorParcial ||
      this.exibirSenha ||
      this.mostrarSucessoGeracao ||
      this.exibirListaPendentes ||
      this.exibirListaPagos
    );
  }

  confirmarGeracao() {
    if (!this.validarGeracaoBoleto()) {
      return;
    }

    this.isLoading = true;

    const dados = {
      amount: this.valorGeracao,
      description: this.descricaoGeracao.trim(),
    };

    this.paymentService.gerarBoleto(dados).subscribe({
      next: (res: any) => {
        console.log('📥 Resposta recebida:', res);

        if (res?.data) {
          this.numeroBoleto = res.data;
          this.valorBoleto = this.valorGeracao;
          this.valorBoletoGerado = this.valorGeracao;

          console.log('🔢 Número gerado:', this.numeroBoleto);
          console.log('💰 Valor gerado:', this.valorBoletoGerado);

          // ✅ USAR setTimeout PARA EVITAR O ERRO:
          setTimeout(() => {
            this.isLoading = false;
            this.exibirGerarBoleto = false;
            this.mostrarSucessoGeracao = true;
            this.mensagemErro = null;
            this.mensagemErroGeracao = null;
            this.cdr.detectChanges();
          }, 500);
        } else {
          this.handleError('Não foi possível gerar o boleto');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Erro ao gerar boleto');
        this.isLoading = false;
      },
    });
  }

  closeModal(): void {
    if (this.timerSucesso) {
      clearTimeout(this.timerSucesso);
      this.timerSucesso = null;
    }

    setTimeout(() => {
      // Resetar o estado ao fechar
      this.numeroBoleto = '';
      this.valorBoleto = 0;
      this.valorPagamento = 0;
      this.senha = '';
      this.exibirValorParcial = false;
      this.exibirSenha = false;
      this.mensagemErro = null;
      this.mensagemErroValor = null;
      this.isLoading = false;

      // Resetar variáveis de geração:
      this.exibirGerarBoleto = false;
      this.valorGeracao = 500;
      this.descricaoGeracao = '';
      this.mensagemErroGeracao = null;

      // Resetar variáveis de sucesso:
      this.mostrarSucessoGeracao = false;
      this.valorBoletoGerado = 0;

      // ✅ RESETAR VARIÁVEIS DE LISTAS:
      this.exibirListaPendentes = false;
      this.exibirListaPagos = false;
      this.boletosPendentes = [];
      this.boletosPagos = [];
      this.carregandoLista = false;
      this.mensagemLista = '';

      // ✅ RESETAR VARIÁVEIS DE VALIDAÇÃO:
      this.boletoValidado = false;
      this.boletoValido = false;
      this.mensagemValidacao = '';
      this.senhaIncorreta = false;

      this.cdr.detectChanges();

      // Fechar o modal
      this.overlayRef.dispose();
    }, 0);
  }

  private handleError(message: string): void {
    this.mensagemErro = message;
    setTimeout(() => {
      this.alertService.showError('Ops! Algo deu errado...', message);
      this.cdr.detectChanges();
    }, 0);
  }
}