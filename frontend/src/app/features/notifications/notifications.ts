import { Component, inject, OnInit } from '@angular/core';
import { SidebarRight } from '../../components/sidebar-right/sidebar-right';
import { NotificationService, NotificationResponse } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../core/services/utils/DateUtil.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [SidebarRight, CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  notifications: NotificationResponse[] = [];
  unreadCount = 0;

  private notificationService = inject(NotificationService);
  private dateUtils = inject(DateUtilsService);
  private router = inject(Router);

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  onNotificationClick(notification: NotificationResponse) {
    const navigate = () => {
      if (notification.type === 'POST' && notification.postId) {
        this.router.navigate(['/posts', notification.postId]);
      } else {
        this.router.navigate(['/profile', notification.actorUsername]);
      }
    };

    if (notification.read) {
      navigate();
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notificationService.updateUnreadCount(this.unreadCount);
        navigate();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        navigate();
      }
    });
  }

  formatDate(dateString: string): string {
    return this.dateUtils.formatDate(dateString);
  }
}
