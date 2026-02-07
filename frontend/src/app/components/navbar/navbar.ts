import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router'; 
import { NotificationService } from '../../service/notification';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-navbar',
  standalone: true, // This is likely true in your project
  imports: [CommonModule, RouterModule], // <--- ADD THIS LINE
  templateUrl: './navbar.html', // Ensure this matches your file name
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  // ... rest of your code stays exactly the same
  notifications: Notification[] = [];
  showDropdown = false;

  constructor(
    private notificationService: NotificationService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  onNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }
    this.router.navigate(['/posts', notification.postId]);
    this.showDropdown = false;
  }
}