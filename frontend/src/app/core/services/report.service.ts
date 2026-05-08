import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ReportService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.reports;
    reportUser(reportedUserId: string, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}`, { reportedUserId, reason, type: "USER" });
    }

    reportPost(reportedPostId: string, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}`, { reportedPostId, reason, type: "POST" });
    }
}