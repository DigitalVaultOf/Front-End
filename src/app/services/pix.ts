import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface PixResponse<T> {
  data: T;
  message: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PixS {
  private apiUrl = `${environment.API_URL}/pix/api/`;
  private apiUrl2 = `${environment.API_URL}/bank/pix/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  hasPix(): Observable<PixResponse<boolean>> {
    return this.http.get<PixResponse<boolean>>(`${this.apiUrl}has`);
  }

  getPix(): Observable<PixResponse<string>> {
    return this.http.get<PixResponse<string>>(`${this.apiUrl}pix`);
  }

  makePix(data: {
    going: string;
    coming: string;
    amount: number;
  }): Observable<PixResponse<string>> {
    return this.http.post<PixResponse<string>>(`${this.apiUrl2}mandar`, data);
  }

  makePixKey(data: {
    name: string;
    pixKey: string;
    bank: string;
  }): Observable<PixResponse<string>> {
    return this.http.post<PixResponse<string>>(`${this.apiUrl2}registrar`, data);
  }
}
