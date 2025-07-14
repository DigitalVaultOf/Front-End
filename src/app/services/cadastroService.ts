import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importamos o garçom (HttpClient)
import { Observable } from 'rxjs'; 

export interface UserData {
    name: string;
    cpf: string;
    email: string;
    password: string;
}
export interface backResponse{
  data: boolean;
  message: string;
}


@Injectable({
    providedIn: 'root'
  })
  export class cadastrar{
    private apiUrl = 'https://localhost:7178';
    

    constructor(private http: HttpClient){}

    cadastrarUsuario(data: UserData): Observable<backResponse> {
      return this.http.post<backResponse>(`${this.apiUrl}/user/api/User/create-user`, data);
    }

}
  