import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apigateway } from '../environments/apigateway';

export interface AskQuestionDto {
  question: string;
}

export interface ChatbotResponseDto {
  answer: string;
}

const API_URL = apigateway.API_URL;

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private API_URL = `${apigateway.API_URL}/ai/api/Chatbot`;

  constructor(private http: HttpClient) {}

  askQuestion(question: string): Observable<ChatbotResponseDto> {
    const payload: AskQuestionDto = { question: question };
    return this.http.post<ChatbotResponseDto>(`${this.API_URL}/Ask`, payload);
  }
}
