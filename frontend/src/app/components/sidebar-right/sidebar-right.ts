import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-right',
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.scss'
})
export class SidebarRight implements OnInit {
  // Properties
  searchQuery: string = '';
  users: User[] = [];
  isSearching: boolean = false;

  // Injected Services
  private userService = inject(UserService);

  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    this.loadDefaultUsers();
  }

  // ===== DATA LOADING =====
  private loadDefaultUsers(): void {
    // Load default users or popular users
    // In a real app, you might load popular users or recent users
    this.users = [];
  }

  // ===== SEARCH ACTIONS =====
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadDefaultUsers();
      return;
    }

    this.isSearching = true;
    this.userService.searchUsers(this.searchQuery.trim()).subscribe({
      next: (users) => {
        this.users = users;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error searching users:', err);
        this.isSearching = false;
      }
    });
  }

  onSearchInput(event: any): void {
    this.searchQuery = event.target.value;
    if (this.searchQuery.length >= 2) {
      this.onSearch();
    } else if (this.searchQuery.length === 0) {
      this.loadDefaultUsers();
    }
  }
}
