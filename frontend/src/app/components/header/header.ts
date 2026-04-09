import { Component, HostListener, inject, signal, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, NotificationResponse } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { Subscription } from 'rxjs';
import { DateUtilsService } from '../../core/services/utils/DateUtil.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  isOpen = signal(false);
  isNotificationsOpen = signal(false);
  currentUser = signal<User | null>(null);
  unreadCount = signal(0);
  isAdmin = signal(false);

  notifications = signal<NotificationResponse[]>([]);
  isLoadingNotifications = signal(false);

  private subscription: Subscription = new Subscription();

  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private dateUtils = inject(DateUtilsService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUnreadCount();
    this.loadCurrentUser();
    this.subscribeToNotificationUpdates();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount.set(count);
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  private loadCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        const normalizedRole = (user.role || '').toUpperCase();
        this.isAdmin.set(normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN');
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  private subscribeToNotificationUpdates() {
    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount.set(count);
      })
    );
  }

  private loadNotifications() {
    this.isLoadingNotifications.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.isLoadingNotifications.set(false);
      },
      error: (error) => {
        this.isLoadingNotifications.set(false);
        console.error('Error loading notifications:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.dateUtils.formatDate(dateString);
  }

  onNotificationClick(notification: NotificationResponse): void {
    const navigate = () => {
      if (notification.type === 'POST' && notification.postId) {
        this.router.navigate(['/posts', notification.postId]);
      } else {
        this.router.navigate(['/profile', notification.actorUsername]);
      }
      this.isNotificationsOpen.set(false);
    };

    if (notification.read) {
      navigate();
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        const updated = this.notifications().map(item => item.id === notification.id ? { ...item, read: true } : item);
        this.notifications.set(updated);
        const count = Math.max(0, this.unreadCount() - 1);
        this.unreadCount.set(count);
        this.notificationService.updateUnreadCount(count);
        navigate();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        navigate();
      }
    });
  }

  toggleDropdown() {
    this.isOpen.update((v: boolean) => !v);
    if (this.isOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.isNotificationsOpen.update((v: boolean) => !v);
    if (this.isNotificationsOpen()) {
      this.isOpen.set(false);
      this.loadNotifications();
      this.loadUnreadCount();
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.dropdown')) {
      this.isOpen.set(false);
    }

    if (!target.closest('.notifications-dropdown')) {
      this.isNotificationsOpen.set(false);
    }
  }

  logout() {
    this.isOpen.set(false);
    this.authService.logout();
  }
}
