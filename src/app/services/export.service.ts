import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private apiUrl = `${environment.API_URL}/api/Report/`; 

  constructor(private http: HttpClient) {}

  generatePDF(): Observable<Blob> {
    return this.http.get<Blob>(`${this.apiUrl}pdf`, { responseType: 'blob' as 'json' });
  }

  generateCSV(): Observable<Blob> {
    return this.http.get<Blob>(`${this.apiUrl}csv`, { responseType: 'blob' as 'json' });
  }
}