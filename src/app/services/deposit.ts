import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apigateway } from '../environments/apigateway';
@Injectable({
  providedIn: 'root'
})
export class Deposit {

  private apiUrl = `${apigateway.API_URL}/movimentation/api/`;

  constructor(private http: HttpClient) { }

  deposit(data: { value: number; password: string }) {
    return this.http.post(`${this.apiUrl}deposit`, data);
  }
}
