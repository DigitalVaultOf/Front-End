import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Deposit {

  private apiUrl = 'https://localhost:7178/user/api/Movimentation';

  constructor(private http: HttpClient) { }

  deposit(value: number){
    return this.http.post(`${this.apiUrl}/deposit`, { value })
  }
}
