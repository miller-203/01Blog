import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersUrl = 'http://localhost:8080/api/user/all';
  private followBaseUrl = 'http://localhost:8080/api/follows';
  private blockBaseUrl = 'http://localhost:8080/api/blocks';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl, { headers: this.getHeaders() });
  }

  followUser(userId: number): Observable<any> {
    return this.http.post(`${this.followBaseUrl}/follow/${userId}`, {}, { headers: this.getHeaders() });
  }

  unfollowUser(userId: number): Observable<any> {
    return this.http.post(`${this.followBaseUrl}/unfollow/${userId}`, {}, { headers: this.getHeaders() });
  }

  getFollowingIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.followBaseUrl}/following/ids`, { headers: this.getHeaders() });
  }

  blockUser(userId: number): Observable<any> {
    return this.http.post(`${this.blockBaseUrl}/${userId}`, {}, { headers: this.getHeaders() });
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.delete(`${this.blockBaseUrl}/${userId}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  getBlockedUserIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.blockBaseUrl}/ids`, { headers: this.getHeaders() });
  }
}
