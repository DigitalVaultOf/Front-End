# ✨ NovaBankTech - Front-End

[![Angular](https://img.shields.io/badge/Angular-20.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![SCSS](https://img.shields.io/badge/SCSS-Sass-pink.svg)](https://sass-lang.com/)

Interface de usuário moderna e responsiva para o sistema bancário digital **NovaBankTech**. Desenvolvida com Angular 20, a aplicação consome a API de microserviços do backend para oferecer uma experiência de usuário completa, incluindo operações financeiras, PIX, pagamentos e um assistente virtual com IA.

## 🚀 Componentes Principais

| Componente | Rota | Descrição | Tecnologias/Padrões |
|------------|------|-----------|---------------------|
| **Login** | `/login` | Autenticação e seleção de contas | AuthService, AlertService |
| **UserRegistration** | `/user-registration` | Cadastro de novos usuários | ReactiveFormsModule, Validadores customizados |
| **Home** | `/home` | Dashboard principal do usuário | AuthGuard, OverlayModule, RxJS |
| **Transferencia** | (modal) | Transferências entre contas | Angular CDK Overlay, HttpClient |
| **Deposito** | (modal) | Depósitos na conta | Angular CDK Overlay, HttpClient |
| **Withdraw** | (modal) | Saques da conta | Angular CDK Overlay, HttpClient |
| **Pix** | (modal) | Módulo do sistema PIX | PixService, UserService |
| **Payment** | (modal) | Pagamento e geração de boletos | PaymentService, AlertService |
| **EditarConta** | (modal) | Edição de dados do usuário | ReactiveFormsModule, UserService |
| **AiChatbot** | (global) | Assistente virtual "Nova" | AiService, localStorage |
| **Export** | (modal) | Exportação de relatórios | ExportService, Geração de Blob |

### Infraestrutura
- **API Gateway** (http://localhost:5005) - Ponto de entrada para os microserviços
- **Angular CLI** - Ferramenta de linha de comando para desenvolvimento e build
- **Karma & Jasmine** - Ferramentas para execução de testes unitários

## ⚡ Stack Tecnológica

### Framework e Linguagem
- **Angular 20** com renderização Zoneless
- **TypeScript 5.8** para tipagem estática
- **SCSS** para estilização avançada e modular
- **HTML5** semântico

### Segurança
- **Auth Guard** (`authGuard`): Protege rotas que exigem autenticação
- **Auth Interceptor** (`authInterceptor`): Anexa o token JWT em todas as requisições HTTP e lida com a expiração de sessão (401/403)

### Componentes e UI
- **Angular CDK** para componentes de overlay (modais dinâmicos)
- **FontAwesome** para iconografia rica e consistente
- **NgxMask** para formatação de inputs (CPF, valores monetários)
- **Design totalmente responsivo** (mobile-first)

### Comunicação com API
- **HttpClient** do Angular com `withFetch()` ativado
- **Serviços dedicados** para cada microserviço (AuthService, UserService, etc.)
- **Tratamento de erros centralizado** e feedback ao usuário via AlertService

### Estado e Reatividade
- **RxJS** para programação reativa e gerenciamento de fluxos de dados assíncronos
- **ChangeDetectorRef** para otimização manual da detecção de mudanças
- **async pipe** para subscrições automáticas no template

### DevOps
- **Scripts NPM** para start, build, watch e test
- **Configuração** para build de produção otimizado

## 🔧 Funcionalidades Principais

### 🔐 Autenticação e Cadastro
- **Login Flexível**: Permite autenticação por número da conta, CPF ou email
- **Seleção de Contas**: Caso o usuário possua múltiplas contas, uma tela de seleção é exibida
- **Cadastro Seguro**: Formulário com validação de CPF e critérios de senha forte (maiúscula, número, caractere especial)
- **Gestão de Sessão**: O AuthService gerencia o token JWT, verifica sua validade e expiração, e realiza o logout automático

### 👤 Gestão de Usuário
- **Dashboard (Home)**: Exibe o saldo e informações da conta com opção de ocultar/mostrar dados sensíveis
- **Edição de Perfil**: Modal para atualização de nome, email e senha
- **Desativação de Conta**: Fluxo de confirmação para desativar a conta de forma segura

### 💰 Operações Bancárias
- **Modais Dedicados**: Interfaces limpas e focadas para Transferência, Depósito e Saque
- **Confirmação por Senha**: Todas as operações financeiras críticas exigem a senha do usuário para confirmação
- **Histórico Paginado**: A tela Home exibe um histórico completo de transações com paginação
- **Filtros e Exportação**: Permite filtrar o histórico por período e exportar os dados para PDF ou CSV

### 💳 Sistema PIX
- **Verificação de Chave**: O sistema verifica se o usuário já possui uma chave PIX ativa
- **Criação de Chave**: Permite ao usuário criar uma nova chave PIX de forma simples
- **Transferência PIX**: Formulário para realizar transferências instantâneas para outras chaves

### 🧾 Pagamentos de Boletos
- **Múltiplas Ações**: Permite pagar um boleto, gerar um novo, ou listar boletos pendentes e pagos
- **Validação Automática**: O código do boleto é validado em tempo real via API
- **Pagamento Parcial**: Oferece a opção de pagar um valor parcial do boleto

### 🤖 Assistente Virtual "Nova"
- **Interface Flutuante**: Chatbot acessível em toda a aplicação
- **Integração com IA**: Conecta-se ao Ai.Api para obter respostas inteligentes
- **Ações Rápidas**: Sugere perguntas comuns para iniciar a conversa
- **Memória de Conversa**: O histórico da conversa é salvo no localStorage

## 🛠️ Execução do Projeto

### Servidor de Desenvolvimento (Recomendado)
```bash
# Clonar o repositório
git clone https://github.com/DigitalVaultOf/Front-End.git
cd Front-End

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200/` em seu navegador. A aplicação será recarregada automaticamente ao salvar qualquer alteração.

### Build e Testes
```bash
# Compilar e otimizar para produção
ng build

# Rodar testes unitários
ng test

# Testes end-to-end
ng e2e

# Linting do código
ng lint
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm start              # ng serve
npm run build          # ng build
npm run watch          # ng build --watch --configuration development
npm test               # ng test
```

## 📡 Integração com Backend

O front-end foi projetado para consumir o **ApiGateway** na porta **5005**, que centraliza o acesso a todos os microserviços.

### Configuração da API
- **URL do Gateway**: `http://localhost:5005` (configurado em `src/app/environments/apigateway.ts`)
- **Interceptor**: O `authInterceptor` anexa o token JWT a todas as requisições, garantindo a comunicação segura com os serviços protegidos
- **Serviços**: Cada funcionalidade possui um serviço Angular correspondente (ex: `payment.service.ts`, `pix.ts`) que encapsula a lógica de chamada à API

### Endpoints Principais
```typescript
// Exemplos de integração
AuthService         → http://localhost:5005/auth/*
UserService         → http://localhost:5005/user/*
PaymentService      → http://localhost:5005/payments/*
PixService          → http://localhost:5005/pix/*
AiService           → http://localhost:5005/ai/*
ExportService       → http://localhost:5005/reports/*
```

> **Nota**: Para que o front-end funcione completamente, a infraestrutura do backend (microserviços, banco de dados e RabbitMQ) deve estar em execução.

## 🔒 Configuração de Ambiente

### Arquivo de Ambiente (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5005',
  appName: 'NovaBankTech',
  version: '1.0.0'
};
```

### Variáveis de Build
```bash
# Desenvolvimento
ng serve --configuration=development

# Produção
ng build --configuration=production --optimization --output-hashing=all
```

## 🧪 Testes

### Estrutura de Testes
```
src/
├── app/
│   ├── components/
│   │   └── *.component.spec.ts    # Testes de componentes
│   ├── services/
│   │   └── *.service.spec.ts      # Testes de serviços
│   └── guards/
│       └── *.guard.spec.ts        # Testes de guards
└── e2e/                          # Testes end-to-end
```

### Executar Testes
```bash
# Testes unitários
ng test

# Testes com coverage
ng test --code-coverage

# Testes end-to-end
ng e2e

# Watch mode
ng test --watch
```

## 📱 Progressive Web App (PWA)

O projeto está configurado como PWA, oferecendo:
- **Instalação** como app nativo
- **Offline capability** (cache de recursos estáticos)
- **Service Worker** para atualizações automáticas
- **Manifest** configurado para dispositivos móveis

```bash
# Adicionar PWA (se não estiver configurado)
ng add @angular/pwa
```

## 🎨 Customização de Tema

### Variáveis SCSS Globais
```scss
// src/styles/variables.scss
:root {
  --primary-color: #1976d2;
  --secondary-color: #424242;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --background-color: #fafafa;
}
```

### Temas Dark/Light
```typescript
// Implementação de toggle de tema
@Component({
  selector: 'app-theme-toggle',
  template: `
    <button (click)="toggleTheme()">
      <i [class]="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
  `
})
```

## 📊 Performance

### Otimizações Implementadas
- ✅ **Lazy Loading** de módulos
- ✅ **OnPush Change Detection**
- ✅ **TrackBy functions** em listas
- ✅ **Async pipe** para observables
- ✅ **Tree shaking** automático
- ✅ **Bundle optimization** para produção

### Métricas Alvo
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Bundle size < 2MB
- Lighthouse Score > 90

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de Node Version**
```bash
# Usar Node.js 18+
nvm use 18
npm install
```

**Erro de Dependências**
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Erro de CORS no desenvolvimento**
```bash
# Configurar proxy no angular.json
ng serve --proxy-config proxy.conf.json
```

**Build falha**
```bash
# Verificar compatibilidade de versões
ng update
npm audit fix
```

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como projeto final do curso de .NET.

## 👥 Equipe de Desenvolvimento

**Grupo 9 - DigitalVault**
- **Raul Netto** - Full Stack Developer
- **Danilo Cossiolo Dias** - Full Stack Developer
- **Eduardo Cimitan** - Full Stack Developer
- **MOISÉS GABRIEL DE CARIS** - Full Stack Developer
- **Marcos "H0wZy" Junior** - Full Stack Developer

## 📞 Contato e Suporte

- **Email**: projetodigitalvault@gmail.com
- **GitHub**: [DigitalVaultOf](https://github.com/DigitalVaultOf)
- **LinkedIn**: [Publicação (parte 1)](https://linkedin.com) do projeto
- **LinkedIn**: [Publicação (parte 2)](https://linkedin.com) do projeto

Para dúvidas técnicas, abra uma issue no GitHub ou entre em contato via email.

---

**Desenvolvido com ❤️ pelo Grupo 9 - DigitalVault**  
*"Construindo o futuro dos serviços bancários digitais"*
