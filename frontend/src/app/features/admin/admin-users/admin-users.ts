import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user';
import { ConfirmDeletePopup } from '../../../components/confirm-delete-popup/confirm-delete-popup';
import { Popup } from '../../../components/popup/popup';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, ConfirmDeletePopup, Popup],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  @ViewChild('popup') popup!: Popup;
  private adminService = inject(AdminService);
  currentUserId = localStorage.getItem('user_id') || '';
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedUsers: User[] = [];
  searchTerm = '';
  statusFilter = 'All Users';
  displayedCount = 10;
  showDeletePopup = false;
  userToDelete: User | null = null;
  showBanPopup = false;
  userToBan: User | null = null;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.displayedUsers = this.filteredUsers.slice(0, this.displayedCount);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.popup.show('Failed to load users. Please try again.', false);
      }
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFilters();
  }

  onStatusFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.statusFilter = target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchTerm) ||
        user.email.toLowerCase().includes(this.searchTerm);
      const matchesStatus = this.statusFilter === 'All Users' ||
        (this.statusFilter === 'Active' && user.status !== 'BANNED') ||
        (this.statusFilter === 'Banned' && user.status === 'BANNED');
      return matchesSearch && matchesStatus;
    });
    this.displayedCount = 10;
    this.displayedUsers = this.filteredUsers.slice(0, this.displayedCount);
  }

  loadMore() {
    this.displayedCount += 10;
    this.displayedUsers = this.filteredUsers.slice(0, this.displayedCount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(user: User): string {
    return user.status === 'BANNED' ? 'banned' : 'active';
  }

  getStatusText(user: User): string {
    return user.status === 'BANNED' ? 'Banned' : 'Active';
  }

  toggleUserStatus(user: User) {

    this.adminService.toggleUserStatus(user.id).subscribe({
      next: (data) => {
        // Update local user status
        user.status = data.status;
        this.popup.show(`User ${String(data.status) === 'BANNED' ? 'banned' : 'unbanned'} successfully.`, true);
      },
      error: (err) => {
        console.error('Error unbanning user:', err);
        if (user.role === 'ADMIN') {
          this.popup.show('You cannot ban admin.', false);
        } else {
          this.popup.show("Failed to ban user.", false);
        }
      }
    });
  }

  deleteUser(user: User) {
    if (user.id === this.currentUserId) {
      this.popup.show('You cannot delete your own admin account.', false);
      return;
    }
    this.userToDelete = user;
    this.showDeletePopup = true;
  }

  confirmDeleteUser() {
    if (this.userToDelete) {
      this.adminService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          // Remove user from local arrays
          this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.userToDelete!.id);
          this.displayedUsers = this.displayedUsers.filter(u => u.id !== this.userToDelete!.id);
          this.showDeletePopup = false;
          this.userToDelete = null;
          this.popup.show('User deleted successfully.', true);
        },
        error: (err) => {
          this.showDeletePopup = false;
          this.userToDelete = null;
          this.popup.show("Failed to delete user.", false);
        }
      });
    }
  }

  cancelDeleteUser() {
    this.showDeletePopup = false;
    this.userToDelete = null;
  }

  banUser(user: User) {
    if (user.id === this.currentUserId) {
      this.popup.show('You cannot ban your own admin account.', false);
      return;
    }
    this.userToBan = user;
    this.showBanPopup = true;
  }

  confirmBanUser() {
    if (this.userToBan) {
      this.toggleUserStatus(this.userToBan);
      this.showBanPopup = false;
      this.userToBan = null;
    }
  }

  cancelBanUser() {
    this.showBanPopup = false;
    this.userToBan = null;
  }
}
