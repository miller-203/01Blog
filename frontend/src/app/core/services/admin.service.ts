import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserLogin, UserRegister, User } from '../models/user';
import { ReportResponse } from '../models/report';
import { environment } from '../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = environment.api.reports;
    private usersApiUrl = environment.api.users;

    getStatus(): Observable<any> {
         return this.http.get<any>(`${this.apiUrl}/report-status`);
    }

    getAllReports(): Observable<ReportResponse[]> {
        return this.http.get<ReportResponse[]>(this.apiUrl);
    }

    putDismiss(reportId: String): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${reportId}/dismiss`, {});
    }

    banUserFromReport(reportId: string, userId: string): Observable<ReportResponse> {
        return this.http.put<ReportResponse>(`${this.apiUrl}/${userId}/ban/${reportId}`, {});
    }

    toggleUserStatus(userId: string): Observable<ReportResponse> {
        return this.http.put<ReportResponse>(`${this.usersApiUrl}/${userId}/status`, {});
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.usersApiUrl}/admin/all`);
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete<any>(`${this.usersApiUrl}/${userId}`);
    }

    deletePost(postId: string): Observable<any> {
        return this.http.delete<any>(`${environment.api.posts}/${postId}`);
    }
}
