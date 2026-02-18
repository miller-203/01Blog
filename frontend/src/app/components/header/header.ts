import { Component, HostListener, inject, signal, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  // Signal States
  isOpen = signal(false);
  isNotificationsOpen = signal(false);
  currentUser = signal<User | null>(null);
  unreadCount = signal(0);
  isAdmin = signal(false);

  // Subscriptions
  private subscription: Subscription = new Subscription();

  // Output Events
  @Output() toggleSidebar = new EventEmitter<void>();

  // Injected Services
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  // ===== LIFECYCLE HOOKS =====
  ngOnInit() {
    this.loadUnreadCount();
    this.loadCurrentUser();
    this.subscribeToNotificationUpdates();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ===== DATA LOADING =====
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

  refreshUnreadCount() {
    this.loadUnreadCount();
  }

  // ===== UI TOGGLE ACTIONS =====
  toggleDropdown() {
    this.isOpen.update((v: boolean) => !v);
    // Close notifications when opening profile dropdown
    if (this.isOpen()) {
      this.isNotificationsOpen.set(false);
    }
    console.log(this.isOpen());
  }

  toggleNotifications() {
    this.isNotificationsOpen.update((v: boolean) => !v);
    // Close profile dropdown when opening notifications
    if (this.isNotificationsOpen()) {
      this.isOpen.set(false);
    }
    console.log('Notifications open:', this.isNotificationsOpen());
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  // ===== EVENT HANDLERS =====
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close profile dropdown if click is outside
    if (!target.closest('.dropdown')) {
      this.isOpen.set(false);
    }

    // Close notifications dropdown if click is outside
    if (!target.closest('.notifications-dropdown')) {
      this.isNotificationsOpen.set(false);
    }
  }

  // ===== AUTHENTICATION ACTIONS =====
  logout() {
    console.log('Logout clicked');
    this.isOpen.set(false);
    console.log('Logging out user');
    this.authService.logout();
  }
}
