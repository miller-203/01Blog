import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { User } from '../models/user';
import { ReportResponse, ReportType } from '../models/report';
import { environment } from '../../../environments/environment.development';
import { Post } from '../models/post';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private adminApiUrl = `${environment.apiUrl}/admin`;

    getStatus(): Observable<any> {
        return forkJoin({
            users: this.getAllUsers(),
            posts: this.getAllPosts(),
            reports: this.getAllReports()
        }).pipe(
            map(({ users, posts, reports }) => ({
                totalUsers: users.length,
                totalPosts: posts.length,
                totalPendingReports: reports.filter(r => r.status === 'PENDING').length
            }))
        );
    }

    getAllPosts(): Observable<Post[]> {
        return this.http.get<any[]>(`${this.adminApiUrl}/posts`).pipe(
            map(posts => posts.map(post => ({
                id: String(post.id),
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                authorId: String(post.user?.id ?? ''),
                authorUsername: post.user?.username ?? '',
                authorName: post.user?.username ?? '',
                hidden: (post.status ?? '').toUpperCase() === 'HIDDEN'
            })))
        );
    }

    getAllReports(): Observable<ReportResponse[]> {
        return this.http.get<any[]>(`${this.adminApiUrl}/reports`).pipe(
            map((reports) => reports.map((report: any) => ({
                reportId: String(report.id),
                reporterId: String(report.reporter?.id ?? ''),
                reporterUsername: report.reporter?.username ?? '',
                reportedUserId: String(report.reportedUser?.id ?? ''),
                reportedUserUsername: report.reportedUser?.username ?? '',
                reportedPostId: report.reportedPost ? String(report.reportedPost.id) : '',
                reason: report.reason,
                timestamp: report.createdAt,
                status: (report.status === "OPEN" ? "PENDING" : report.status),
                type: report.type === "POST" ? ReportType.POST : ReportType.USER
            })))
        );
    }

    putDismiss(reportId: String): Observable<any> {
        return this.http.put<any>(`${this.adminApiUrl}/reports/${reportId}/resolve`, {});
    }

    banUserFromReport(reportId: string, userId: string): Observable<any> {
        return this.http.put<any>(`${this.adminApiUrl}/users/${userId}/ban`, {}).pipe(
            map(() => ({ reportId, status: 'RESOLVED' }))
        );
    }

    toggleUserStatus(userId: string): Observable<any> {
        return this.http.put<any>(`${this.adminApiUrl}/users/${userId}/ban`, {}).pipe(
            map((user) => ({ status: user.status }))
        );
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<any[]>(`${this.adminApiUrl}/users`).pipe(
            map(users => users.map(user => ({
                ...user,
                id: String(user.id),
                avatarUrl: user.avatarUrl ?? user.profilePicUrl ?? ''
            })))
        );
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.adminApiUrl}/users/${userId}`, { responseType: 'text' });
    }

    deletePost(postId: string): Observable<any> {
        return this.http.delete(`${this.adminApiUrl}/posts/${postId}`, { responseType: 'text' });
    }

    togglePostVisibility(postId: string): Observable<any> {
        return this.http.put<any>(`${this.adminApiUrl}/posts/${postId}/toggle-hide`, {});
    }
}
