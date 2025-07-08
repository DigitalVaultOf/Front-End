import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs'; // forkJoin é para fazer múltiplas chamadas

// URL CORRETA, TIRADA DO SEU ARQUIVO
const API_URL = 'https://localhost:7178';

// Interface para ajudar o TypeScript a entender os dados do usuário
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  accounts: {
    corrente: string;
    poupanca: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  /**
   * Busca os dados do usuário usando o número da conta.
   * Você precisará ter o 'accountNumber' salvo no localStorage após o login.
   */
  getUserByAccountNumber(accountNumber: string): Observable<UserProfile> {
    // Corresponde a [HttpGet("GetAccountByNumber/{accountNumber}")]
    return this.http.get<UserProfile>(`${API_URL}/api/user/GetAccountByNumber/${accountNumber}`);
  }

  /**
   * Atualiza os dados do usuário (nome/email) e a senha em chamadas separadas, se necessário.
   */
  updateUserAndOrPassword(userId: string, data: any): Observable<any> {
    const updateProfilePayload = {
      name: data.name,
      email: data.email
    };
    
    // 1. Prepara a chamada para atualizar o perfil (nome/email)
    // Corresponde a [HttpPut("update-user/{id:guid}")]
    const updateUserCall = this.http.put(`${API_URL}/api/user/update-user/${userId}`, updateProfilePayload);

    // 2. Prepara a chamada para atualizar a senha, APENAS SE os campos foram preenchidos
    let updatePasswordCall;
    if (data.currentPassword && data.newPassword) {
      const updatePasswordPayload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      };
      // Corresponde a [HttpPost("update-password/{id:guid}")]
      updatePasswordCall = this.http.post(`${API_URL}/api/user/update-password/${userId}`, updatePasswordPayload);
    }

    // Se a senha não vai ser alterada, executa apenas a primeira chamada
    if (!updatePasswordCall) {
      return updateUserCall;
    }

    // Se ambos (perfil e senha) precisam ser alterados, executa as duas chamadas em paralelo
    // e só retorna quando ambas terminarem.
    return forkJoin([updateUserCall, updatePasswordCall]);
  }
}