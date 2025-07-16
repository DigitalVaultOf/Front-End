import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class Deposit {

  private apiUrl = `${environment.API_URL}/movimentation/api/`;

  constructor(private http: HttpClient) { }

  deposit(data: { value: number; password: string }) {
    return this.http.post(`${this.apiUrl}deposit`, data);
  }
}
