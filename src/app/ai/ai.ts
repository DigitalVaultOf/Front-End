import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, ChatbotResponseDto } from '../services/ai.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faRobot,
  faTimes,
  faPaperPlane,
  faSpinner,
  faChevronUp,
  faChevronDown,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ConfirmationService } from '../services/confirmation.service';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <!-- Floating Chat Button -->
    <div class="chat-container" [class.expanded]="isExpanded">
      <!-- Toggle Button -->
      <button
        class="chat-toggle-btn"
        (click)="toggleChat()"
        [class.expanded]="isExpanded"
      >
        <fa-icon
          [icon]="isExpanded ? faTimes : faRobot"
          class="toggle-icon"
        ></fa-icon>
        <span class="btn-text" *ngIf="!isExpanded">Nova</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="isExpanded">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-content">
            <fa-icon [icon]="faRobot" class="header-icon"></fa-icon>
            <div class="header-text">
              <h3>Nova</h3>
              <p>Assistente virtual especializada em serviços bancários</p>
            </div>
          </div>
          <div class="header-actions">
            <!-- ✅ BOTÃO PARA LIMPAR HISTÓRICO -->
            <button
              class="clear-btn"
              (click)="clearChatHistory()"
              title="Limpar histórico"
              *ngIf="messages.length > 0"
            >
              <fa-icon [icon]="faTrash"></fa-icon>
            </button>
            <button class="minimize-btn" (click)="toggleChat()">
              <fa-icon [icon]="faChevronDown"></fa-icon>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div 
          class="messages-container" 
          #messagesContainer
          (scroll)="onUserScroll($event)"
        >
          <div class="welcome-message" *ngIf="messages.length === 0">
            <fa-icon [icon]="faRobot" class="welcome-icon"></fa-icon>
            <h4>Olá! 👋</h4>
            <p>
              Me chamo Nova, sou sua assistente virtual e irei te auxiliar com
              suas dúvidas bancárias. Como posso te ajudar hoje?
            </p>
            <div class="quick-actions">
              <button
                class="quick-btn"
                *ngFor="let action of quickActions"
                (click)="sendQuickMessage(action.message)"
              >
                {{ action.text }}
              </button>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="messages-list" *ngIf="messages.length > 0">
            <div
              class="message"
              *ngFor="let message of messages; trackBy: trackByMessageId"
              [class.user-message]="message.isUser"
              [class.ai-message]="!message.isUser"
            >
              <div class="message-avatar">
                <fa-icon
                  [icon]="faRobot"
                  *ngIf="!message.isUser"
                  class="ai-avatar"
                ></fa-icon>
                <div *ngIf="message.isUser" class="user-avatar">
                  {{ userInitials }}
                </div>
              </div>

              <div class="message-content">
                <div class="message-bubble">
                  <div *ngIf="message.isLoading" class="loading-message">
                    <fa-icon [icon]="faSpinner" class="loading-icon"></fa-icon>
                    <span>Pensando...</span>
                  </div>
                  <p *ngIf="!message.isLoading">{{ message.text }}</p>
                </div>
                <span class="message-time">{{
                  formatTime(message.timestamp)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <input
              type="text"
              class="message-input"
              [(ngModel)]="currentMessage"
              (keypress)="onKeyPress($event)"
              [disabled]="isLoading"
              placeholder="Digite sua pergunta..."
              #messageInput
            />
            <button
              class="send-btn"
              (click)="sendMessage()"
              [disabled]="!currentMessage.trim() || isLoading"
            >
              <fa-icon
                [icon]="isLoading ? faSpinner : faPaperPlane"
                [class.spinning]="isLoading"
              ></fa-icon>
            </button>
          </div>
          <p class="input-hint">
            Pergunte sobre nossos serviços: pagamentos, transferências, PIX,
            saldo...
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui,
          sans-serif;
      }

      .chat-toggle-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 25px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        font-size: 14px;
        min-width: 60px;
        justify-content: center;
      }

      .chat-toggle-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
      }

      .chat-toggle-btn.expanded {
        border-radius: 50%;
        width: 60px;
        height: 60px;
        padding: 0;
        background: #ff4757;
      }

      .toggle-icon {
        font-size: 20px;
        transition: transform 0.3s ease;
      }

      .btn-text {
        white-space: nowrap;
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideUpFade {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        font-size: 24px;
        opacity: 0.9;
      }

      .header-text h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .header-text p {
        margin: 2px 0 0 0;
        font-size: 12px;
        opacity: 0.8;
      }

      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .clear-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .clear-btn:hover {
        background: rgba(255, 82, 82, 0.8);
        transform: scale(1.05);
      }

      .minimize-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .minimize-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 0;
        background: #f8f9fa;
        /* ✅ MELHOR SCROLL BEHAVIOR */
        scroll-behavior: smooth;
      }

      .welcome-message {
        text-align: center;
        padding: 40px 20px;
        color: #495057;
      }

      .welcome-icon {
        font-size: 48px;
        color: #667eea;
        margin-bottom: 15px;
      }

      .welcome-message h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #333;
      }

      .welcome-message p {
        margin: 0 0 20px 0;
        color: #666;
        line-height: 1.4;
      }

      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 20px;
      }

      .quick-btn {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        color: #495057;
      }

      .quick-btn:hover {
        background: #667eea;
        color: white;
        transform: translateY(-1px);
      }

      .messages-list {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .message {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .user-message {
        flex-direction: row-reverse;
      }

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .ai-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 16px;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-avatar {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        color: white;
        font-size: 16px;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }

      .message-content {
        max-width: 250px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-message .message-content {
        align-items: flex-end;
      }

      .message-bubble {
        background: white;
        border-radius: 18px;
        padding: 12px 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
      }

      .user-message .message-bubble {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .message-bubble p {
        margin: 0;
        line-height: 1.4;
        font-size: 14px;
      }

      .loading-message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
      }

      .loading-icon {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .message-time {
        font-size: 11px;
        color: #adb5bd;
        margin-top: 2px;
      }

      .input-area {
        padding: 20px;
        background: white;
        border-top: 1px solid #e9ecef;
      }

      .input-container {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .message-input {
        flex: 1;
        border: 1px solid #e9ecef;
        border-radius: 25px;
        padding: 12px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .message-input:focus {
        border-color: #667eea;
      }

      .message-input:disabled {
        background: #f8f9fa;
        cursor: not-allowed;
      }

      .send-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .send-btn:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      .input-hint {
        margin: 8px 0 0 0;
        font-size: 11px;
        color: #adb5bd;
        text-align: center;
      }

      /* Scrollbar Styles */
      .messages-container::-webkit-scrollbar {
        width: 6px;
      }

      .messages-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .messages-container::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 3px;
      }

      .messages-container::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .chat-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 140px);
          right: 20px;
          left: 20px;
        }

        .chat-container {
          right: 20px;
          left: auto;
        }
      }
    `,
  ],
})
export class AiChatbot implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Icons
  faRobot = faRobot;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faTrash = faTrash;

  // State
  isExpanded = false;
  isLoading = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  userInitials = 'U';

  // ✅ CONTROLE INTELIGENTE DE SCROLL
  private shouldScrollToBottom = true;
  private isUserScrolling = false;
  private lastMessageCount = 0;

  // ✅ CHAVE PARA ARMAZENAMENTO LOCAL
  private readonly STORAGE_KEY = 'novabanktech_nova_chatbot_messages';

  quickActions = [
    { text: '💳 Como pagar um boleto?', message: 'Como pagar um boleto?' },
    {
      text: '💰 Como consultar meu saldo?',
      message: 'Como consultar meu saldo?',
    },
    { text: '⚡ Como fazer PIX?', message: 'Como fazer PIX?' },
    { text: '📊 Como ver meu histórico?', message: 'Como ver meu histórico?' },
  ];

  constructor(
    private aiService: AiService,
    private userService: UserService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    // ✅ CARREGAR MENSAGENS SALVAS AO INICIALIZAR
    this.loadMessagesFromStorage();

    this.userService.GetUserById().subscribe((userData) => {
      this.userInitials = userData?.name?.substring(0, 1).toUpperCase() || 'U';
    });
  }

  ngOnDestroy() {
    // Cleanup se necessário
  }

  ngAfterViewChecked() {
    // ✅ SÓ FAZER SCROLL AUTOMÁTICO EM SITUAÇÕES ESPECÍFICAS
    this.handleAutoScroll();
  }

  // ✅ NOVO MÉTODO: CONTROLE INTELIGENTE DE SCROLL
  private handleAutoScroll(): void {
    const currentMessageCount = this.messages.length;
    
    // Só fazer scroll automático se:
    // 1. Deve fazer scroll (nova mensagem ou chat acabou de abrir)
    // 2. Usuário não está scrollando manualmente
    // 3. Houve mudança no número de mensagens
    if (this.shouldScrollToBottom && !this.isUserScrolling && currentMessageCount !== this.lastMessageCount) {
      this.scrollToBottom();
      this.lastMessageCount = currentMessageCount;
    }
  }

  // ✅ NOVO MÉTODO: DETECTAR SCROLL MANUAL DO USUÁRIO
  onUserScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100; // pixels do final
    
    // Verificar se usuário está próximo do final
    const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
    
    // Se usuário scrollou para cima (longe do final), parar scroll automático
    if (!isNearBottom) {
      this.isUserScrolling = true;
      this.shouldScrollToBottom = false;
      console.log('🔍 Usuário navegando no histórico - scroll automático pausado');
    } else {
      // Se usuário voltou para perto do final, reativar scroll automático
      this.isUserScrolling = false;
      this.shouldScrollToBottom = true;
      console.log('⬇️ Usuário próximo ao final - scroll automático reativado');
    }
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      // ✅ REATIVAR SCROLL AUTOMÁTICO AO ABRIR
      this.shouldScrollToBottom = true;
      this.isUserScrolling = false;
      
      // Focus no input quando abrir
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  sendQuickMessage(message: string) {
    // ✅ REATIVAR SCROLL AUTOMÁTICO AO ENVIAR QUICK MESSAGE
    this.shouldScrollToBottom = true;
    this.isUserScrolling = false;
    this.currentMessage = message;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    // ✅ REATIVAR SCROLL AUTOMÁTICO AO ENVIAR NOVA MENSAGEM
    this.shouldScrollToBottom = true;
    this.isUserScrolling = false;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);

    // ✅ SALVAR APÓS ADICIONAR MENSAGEM DO USUÁRIO
    this.saveMessagesToStorage();

    // Criar mensagem de loading
    const loadingMessage: ChatMessage = {
      id: this.generateId(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    this.messages.push(loadingMessage);

    const question = this.currentMessage.trim();
    this.currentMessage = '';
    this.isLoading = true;

    // Chamar o serviço de AI
    this.aiService.askQuestion(question).subscribe({
      next: (response: ChatbotResponseDto) => {
        // ✅ GARANTIR SCROLL PARA NOVA RESPOSTA
        this.shouldScrollToBottom = true;
        
        this.messages = this.messages.filter((m) => m.id !== loadingMessage.id);

        const aiResponse: ChatMessage = {
          id: this.generateId(),
          text: response.answer,
          isUser: false,
          timestamp: new Date(),
        };

        this.messages.push(aiResponse);

        // ✅ SALVAR APÓS ADICIONAR RESPOSTA DA AI
        this.saveMessagesToStorage();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao enviar mensagem para AI:', error);

        // ✅ GARANTIR SCROLL PARA MENSAGEM DE ERRO
        this.shouldScrollToBottom = true;
        
        this.messages = this.messages.filter((m) => m.id !== loadingMessage.id);

        const errorMessage: ChatMessage = {
          id: this.generateId(),
          text: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
          isUser: false,
          timestamp: new Date(),
        };

        this.messages.push(errorMessage);

        // ✅ SALVAR MESMO EM CASO DE ERRO
        this.saveMessagesToStorage();

        this.isLoading = false;
      },
    });
  }

  // ✅ MÉTODO PARA SALVAR MENSAGENS NO LOCALSTORAGE
  private saveMessagesToStorage(): void {
    try {
      // Filtrar mensagens de loading antes de salvar
      const messagesToSave = this.messages.filter((m) => !m.isLoading);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messagesToSave));
      console.log('💾 Mensagens da Nova salvas no localStorage');
    } catch (error) {
      console.warn('Erro ao salvar mensagens da Nova:', error);
    }
  }

  // ✅ MÉTODO PARA CARREGAR MENSAGENS DO LOCALSTORAGE
  private loadMessagesFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        // Validar estrutura das mensagens
        if (Array.isArray(parsedMessages)) {
          this.messages = parsedMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp), // Converter string para Date
          }));
          console.log(
            `📱 ${this.messages.length} mensagens da Nova carregadas do localStorage`
          );
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar mensagens da Nova:', error);
      this.messages = [];
    }
  }

  // ✅ MÉTODO PARA LIMPAR HISTÓRICO
  clearChatHistory(): void {
    const title = 'Limpar histórico';
    const message = 'Tem certeza que deseja limpar todo o histórico de conversas com a Nova?';
    
    this.confirmationService.show(title, message).subscribe((result) => {
      if (result) {
        this.messages = [];
        localStorage.removeItem(this.STORAGE_KEY);
        
        // ✅ RESETAR CONTROLES DE SCROLL
        this.shouldScrollToBottom = true;
        this.isUserScrolling = false;
        this.lastMessageCount = 0;
        
        console.log('🗑️ Histórico do chat da Nova limpo');
      }
    });
  }

  // ✅ MÉTODO ATUALIZADO: SCROLL COM CONTROLE
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.warn('Erro ao fazer scroll:', err);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}