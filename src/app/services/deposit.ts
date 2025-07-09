import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Deposit {

  private apiUrl = 'https://localhost:7178/user/api/Movimentation';

  constructor(private http: HttpClient) { }

  deposit(data: { value: number; password: string }) {
    return this.http.post(`${this.apiUrl}/deposit`, data);
  }
}
