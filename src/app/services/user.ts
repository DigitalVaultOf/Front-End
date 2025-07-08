import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://localhost:7178/user/api/User/';

  constructor(private http: HttpClient, private auth: Auth) {}

  getUser(): Observable<UserI> {
    return this.http.get<UserI>(`${this.apiUrl}GetAccountByNumber`);
  }
}
