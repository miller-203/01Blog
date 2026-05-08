import { Component, HostBinding, Input, inject, OnInit } from '@angular/core';
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
  @Input() isOpenInput = false;

  @HostBinding('class.open')
  get isOpenClass() {
    return this.isOpenInput;
  }

  searchQuery = '';
  users: User[] = [];
  isSearching = false;
  followingUserIds = new Set<string>();

  private userService = inject(UserService);

  ngOnInit(): void {
    this.loadDefaultUsers();
  }

  private loadDefaultUsers(): void {
    this.onSearch();
  }

  onSearch(): void {
    this.isSearching = true;
    this.userService.searchUsers(this.searchQuery.trim()).subscribe({
      next: (users) => {
        this.users = users.filter((u) => !u.currentUser);
        this.isSearching = false;
        this.users.forEach((user) => {
          this.userService.isFollowing(user.id).subscribe({
            next: (isFollowing) => {
              if (isFollowing) {
                this.followingUserIds.add(user.id);
              } else {
                this.followingUserIds.delete(user.id);
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error searching users:', err);
        this.isSearching = false;
      }
    });
  }

  onSearchInput(event: any): void {
    this.searchQuery = event.target.value;
    this.onSearch();
  }

  toggleFollow(user: User, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const isFollowing = this.followingUserIds.has(user.id);
    const action = isFollowing ? this.userService.unfollow(user.id) : this.userService.follow(user.id);
    action.subscribe({
      next: () => {
        if (isFollowing) {
          this.followingUserIds.delete(user.id);
        } else {
          this.followingUserIds.add(user.id);
        }
      },
      error: (err) => console.error('Follow toggle failed', err)
    });
  }
}
