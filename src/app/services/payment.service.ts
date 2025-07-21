import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apigateway } from '../environments/apigateway';

// ✅ INTERFACES CORRETAS BASEADAS NA SUA API:

interface ValidateBankSlipResponse {
  data?: {
    bankSlipNumber: string;
    amount: number;
    accountNumber: string;
    createdAt: string;
    dueDate: string;
    isPaid: boolean;
    paymentDate?: string;
    description?: string;
    customer: string;
  };
  message?: string;
}

interface GenerateBankSlipResponse {
  data?: {
    bankSlipNumber: string;
    amount: number;
    dueDate: string;
    description?: string;
  };
  message?: string;
}

interface PaymentResponse {
  data?:
    | {
        bankSlipNumber: string;
        accountNumber: string;
        originalAmount: number;
        amountPaid: number;
        remainingAmount: number;
        isFullyPaid: boolean;
        paymentDate: string;
        description?: string;
        customer: string;
        isSuccess: boolean;
      }
    | boolean; // Para PayBankSlip que retorna só boolean
  message?: string;
}

interface BoletoListResponse {
  data?: Array<{
    paymentId: string;
    bankSlipNumber: string;
    amountBeforePay?: number;
    amount: number;
    amountAfterPay: number;
    createdAt: string;
    dueDate: string;
    isPaid: boolean;
    paymentDate?: string;
    description?: string;
    accountNumber: string;
    customer: string;
  }>;
  message?: string;
}

// REMOVER TUDO DEPOIS DESTE COMENTÁRIO E COLOCAR AS INTERFACES CORRETAS BASEADAS NA SUA API
interface BoletoResponse {
  data?: {
    numeroBoleto?: string;
    valor?: number;
    status?: string;
    dataPagamento?: string;
  };
  message?: string;
}

interface BoletosListResponse {
  data?: Array<{
    numeroBoleto: string;
    valor: number;
    status: string;
    dataPagamento?: string;
  }>;
  message?: string;
}
// REMOVER TUDO ANTES DESTE COMENTÁRIO E COLOCAR AS INTERFACES CORRETAS BASEADAS NA SUA API

const API_URL = apigateway.API_URL;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private API_URL = `${API_URL}/payments/api/Payments`;

  constructor(private http: HttpClient) {}

  // ✅ VALIDAR BOLETO (GET com parâmetro na URL)
  validarBoleto(bankSlipNumber: string): Observable<ValidateBankSlipResponse> {
    return this.http.get<ValidateBankSlipResponse>(
      `${this.API_URL}/ValidateBankSlip/${bankSlipNumber}`
    );
  }

  // ✅ GERAR BOLETO (POST com payload)
  gerarBoleto(dados: {
    amount: number;
    description: string;
    dueDate?: string;
  }): Observable<GenerateBankSlipResponse> {
    return this.http.post<GenerateBankSlipResponse>(
      `${this.API_URL}/GenerateBankSlip`,
      dados
    );
  }

  // ✅ PAGAR BOLETO INTEGRAL (POST)
  pagarBoleto(dados: {
    bankSlipNumber: string;
    userPassword: string;
  }): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.API_URL}/PayBankSlip`,
      dados
    );
  }

  // ✅ PAGAR BOLETO PARCIAL (POST)
  pagarBoletoParcial(dados: {
    bankSlipNumber: string;
    userPassword: string;
    amountToPay: number;
  }): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.API_URL}/PayPartialBankSlip`,
      dados
    );
  }

  // ✅ LISTAR BOLETOS PENDENTES (GET)
  listarBoletosPendentes(): Observable<BoletoListResponse> {
    return this.http.get<BoletoListResponse>(
      `${this.API_URL}/GetPendingBankSlips`
    );
  }

  // ✅ LISTAR BOLETOS PAGOS (GET)
  listarBoletosPagos(): Observable<BoletoListResponse> {
    return this.http.get<BoletoListResponse>(
      `${this.API_URL}/GetPaidBankSlips`
    );
  }
}
