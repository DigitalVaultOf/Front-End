import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apigateway } from '../environments/apigateway';

const API_URL = apigateway.API_URL;

export interface GetUserDto {
  id: string;
  name: string;
  email: string;
  cpf: string;
  accountNumber: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CreateAccountDto {
  name: string;
  cpf: string;
  email: string;
  password: string;
}

export interface ResponseModel<T> {
  data: T;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  CreateUserWithAccount(
    data: CreateAccountDto
  ): Observable<ResponseModel<boolean>> {
    return this.http.post<ResponseModel<boolean>>(
      `${API_URL}/user/api/create-user`,
      data
    );
  }

  GetUserById(): Observable<GetUserDto> {
    return this.http
      .get<ResponseModel<GetUserDto>>(`${API_URL}/user/api/GetUserById`)
      .pipe(map((response) => response.data));
  }

  UpdateUser(updateUserDto: GetUserDto): Observable<boolean> {
    return this.http
      .put<ResponseModel<boolean>>(
        `${API_URL}/user/api/update-user`,
        updateUserDto
      )
      .pipe(map((response) => response.data));
  }

  UpdatePassword(updatePasswordDto: UpdatePasswordDto): Observable<boolean> {
    return this.http
      .post<ResponseModel<boolean>>(
        `${API_URL}/user/api/update-password`,
        updatePasswordDto
      )
      .pipe(map((response) => response.data));
  }

  DeleteUser(accountNumber: string): Observable<boolean> {
    return this.http
      .delete<ResponseModel<boolean>>(
        `${API_URL}/user/api/delete-user/${accountNumber}`
      )
      .pipe(map((response) => response.data));
  }
}
