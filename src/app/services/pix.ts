import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface pixI {
  data: {
    validacao: boolean,
  };
}

@Injectable({
  providedIn: 'root',
})
export class Pix {
  private apiUrl = `${environment.API_URL}/pix/api/`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  getMovimentacoesUltimaSemana(): Observable<{ data: pixI}> {
    return this.http.get<{ data: pixI }>(
      `${this.apiUrl}get`
    );
  }
}
