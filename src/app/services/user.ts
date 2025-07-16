import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import{ environment } from '../environments/environment';

export interface UserI {
  data: {
    accountNumber: string;
    accountType: string;
    balance: number;
    name: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiUrl = `${environment.API_URL}/user/api/`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getUser(): Observable<UserI> {
    return this.http.get<UserI>(`${this.apiUrl}GetAccountByNumber`);
  }
}
