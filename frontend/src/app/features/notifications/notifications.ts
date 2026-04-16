import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { NotificationService, NotificationResponse } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../core/services/utils/DateUtil.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit, AfterViewInit {
  notifications: NotificationResponse[] = [];
  visibleNotifications: NotificationResponse[] = [];
  unreadCount = 0;
  pageSize = 10;
  currentPage = 0;
  hasMoreNotifications = true;
  isLoading = false;
  private scrollObserver?: IntersectionObserver;

  @ViewChild('loadMoreTrigger') loadMoreTrigger?: ElementRef<HTMLDivElement>;

  private notificationService = inject(NotificationService);
  private dateUtils = inject(DateUtilsService);
  private router = inject(Router);

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngAfterViewInit(): void {
    this.setupScrollObserver();
  }

  private setupScrollObserver(): void {
    if (!this.loadMoreTrigger) return;
    this.scrollObserver?.disconnect();
    this.scrollObserver = new IntersectionObserver((entries) => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        this.loadMoreNotifications();
      }
    }, { rootMargin: '220px 0px' });

    this.scrollObserver.observe(this.loadMoreTrigger.nativeElement);
  }

  loadNotifications() {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.currentPage = 0;
        this.visibleNotifications = [];
        this.hasMoreNotifications = notifications.length > 0;
        this.loadMoreNotifications();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoreNotifications(): void {
    if (!this.hasMoreNotifications || this.isLoading) return;
    const start = this.currentPage * this.pageSize;
    const next = this.notifications.slice(start, start + this.pageSize);

    if (next.length === 0) {
      this.hasMoreNotifications = false;
      return;
    }

    this.visibleNotifications = [...this.visibleNotifications, ...next];
    this.currentPage++;
    this.hasMoreNotifications = start + this.pageSize < this.notifications.length;
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
