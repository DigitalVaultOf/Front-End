import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importamos o garçom (HttpClient)
import { Observable } from 'rxjs'; 

export interface UserData {
    name: string;
    cpf: string;
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
  })
  export class cadastrar{
    private apiUrl = 'https://localhost:7178';
    

    constructor( private http: HttpClient){}

    cadastrarUsuario(data: UserData): Observable<string> {
      return this.http.post<string>(`${this.apiUrl}/user/api/User/create`, data,{
         responseType: 'text' as 'json'
      });
    }

}
  