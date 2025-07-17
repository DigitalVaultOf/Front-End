import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


export interface Movimentacao {
  acountNumberTo: string | null | undefined;
  movimentTypeEnum: string;
  dateTimeMoviment: string;
  amount: number;
  acountNumber: string;
}

export interface MovimentHistoryDto {
  dateTimeMoviment: Date;
  amount: number;
  movimentTypeEnum: string;
  acountNumber: string;
  acountNumberTo?: string|null;
}

export interface PagesOfMovimentHistoryDto {
  pages: MovimentHistoryDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  pageCout?: number;
}

export interface ResponseModel<T> {
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Estrato {
  private apiUrl = `${environment.API_URL}/movimentation/api/`;

  constructor(private http: HttpClient) {}

  
  getHistoryPaginated(page: number, pageSize: number): Observable<ResponseModel<PagesOfMovimentHistoryDto>> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ResponseModel<PagesOfMovimentHistoryDto>>(`${this.apiUrl}history`, { params });
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
