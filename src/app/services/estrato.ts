import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Movimentacao {
  acountNumberTo: string | null;
  movimentTypeEnum: string;
  dateTimeMoviment: string;
  amount: number;
  acountNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class Estrato {
  private apiUrl = 'https://localhost:7178/user/api/Movimentation/';

  constructor(private http: HttpClient) {}

  getHistory(): Observable<{ data: Movimentacao[] }> {
    return this.http.get<{ data: Movimentacao[] }>(
      `${this.apiUrl}listmovimentation`
    );
  }

  getMovimentacoesUltimaSemana(): Observable<{ data: Movimentacao[] }> {
    return this.http.get<{ data: Movimentacao[] }>(
      `${this.apiUrl}listmovimentation/1weak`
    );
  }

  carregarMovimentacoesMes(): Observable<{ data: Movimentacao[] }> {
    return this.http.get<{ data: Movimentacao[] }>(
      `${this.apiUrl}listmovimentation/1mounth`
    );
  }
}
