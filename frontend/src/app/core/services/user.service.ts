import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.api.users;
  private http = inject(HttpClient);

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      map((user) => this.normalizeUserMediaUrls(user))
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`).pipe(
      map((user) => this.normalizeUserMediaUrls(user))
    );
  }

  follow(userId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/follows/follow/${userId}`, {});
  }

  unfollow(userId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/follows/unfollow/${userId}`, {});
  }

  isFollowing(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/follows/${userId}/status`);
  }

  getFollowingIds(): Observable<number[]> {
    return this.http.get<number[]>(`${environment.apiUrl}/follows/following/ids`);
  }

  searchUsers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?username=${username}`).pipe(
      map((users) => users.map((user) => this.normalizeUserMediaUrls(user)))
    );
  }

  updateProfile(formData: FormData): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/profile`, formData).pipe(
      map((user) => this.normalizeUserMediaUrls(user))
    );
  }

  private normalizeUserMediaUrls(user: User): User {
    return {
      ...user,
      avatarUrl: this.toAbsoluteUrl(user.avatarUrl),
      coverUrl: this.toAbsoluteUrl(user.coverUrl)
    };
  }

  private toAbsoluteUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const apiBase = new URL(this.apiUrl, window.location.origin);
    return new URL(url, apiBase.origin).toString();
  }
}
