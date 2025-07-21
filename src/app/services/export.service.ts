import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apigateway } from '../environments/apigateway';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private apiUrl = `${apigateway.API_URL}/api/Report/`; 

  constructor(private http: HttpClient) {}

  generatePDF(): Observable<Blob> {
    return this.http.get<Blob>(`${this.apiUrl}pdf`, { responseType: 'blob' as 'json' });
  }

  generateCSV(): Observable<Blob> {
    return this.http.get<Blob>(`${this.apiUrl}csv`, { responseType: 'blob' as 'json' });
  }
}