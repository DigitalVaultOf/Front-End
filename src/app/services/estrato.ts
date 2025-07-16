import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Movimentacao {
  acountNumberTo: string | null;
  movimentTypeEnum: string;
  dateTimeMoviment: string;
  amount: number;
  acountNumber: string;
}

export interface MovimentacaoResponse {
  data: Movimentacao[];
  totalPages: number;
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class Estrato {
  private apiUrl = `${environment.API_URL}/movimentation/api/`;

  constructor(private http: HttpClient) {}

  
  getHistoryPaginated(page: number, pageSize: number): Observable<MovimentacaoResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<MovimentacaoResponse>(`${this.apiUrl}history`, { params });
  }

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
