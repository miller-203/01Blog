import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Added HttpHeaders
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/user/all';
  private followUrl = 'http://localhost:8080/api/follows/follow'; // Updated path

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  followUser(userId: number): Observable<any> {
    // Note the path change to match your FollowController @PostMapping("/follow/{userId}")
    return this.http.post(`${this.followUrl}/${userId}`, {}, { headers: this.getHeaders() });
  }
}