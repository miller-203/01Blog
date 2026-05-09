import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationResponse {
  id: number;
  actorId: string;
  actorUsername: string;
  actorFirstName: string;
  actorLastName: string;
  actorAvatar: string;
  type: string;
  postId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl).pipe(
      map((notifications) =>
        notifications.map((notification) => ({
          ...notification,
          actorAvatar: this.toAbsoluteUrl("uploads/" + notification.actorAvatar)
        }))
      )
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  private toAbsoluteUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const apiBase = new URL(this.apiUrl, window.location.origin);
    return new URL(url, apiBase.origin).toString();
  }
}
