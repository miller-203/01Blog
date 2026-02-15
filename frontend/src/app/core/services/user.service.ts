import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.api.users;
  private http = inject(HttpClient);

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`);
  }

  follow(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl.replace('/users', '/follows')}/${userId}`, {});
  }

  unfollow(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl.replace('/users', '/follows')}/${userId}`);
  }

  isFollowing(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl.replace('/users', '/follows')}/${userId}/status`);
  }

  searchUsers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?username=${username}`);
  }

  updateProfile(formData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, formData);
  }
}
