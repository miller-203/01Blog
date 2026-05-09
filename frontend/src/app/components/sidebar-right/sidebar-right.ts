import { Component, HostBinding, Input, OnDestroy, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar-right',
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.scss'
})
export class SidebarRight implements OnInit, OnDestroy {
  @Input() isOpenInput = false;

  @HostBinding('class.open')
  get isOpenClass() {
    return this.isOpenInput;
  }

  searchQuery = '';
  users: User[] = [];
  isSearching = false;
  followingUserIds = new Set<string>();
  followActionInProgress = new Set<string>();
  private destroy$ = new Subject<void>();

  private userService = inject(UserService);

  ngOnInit(): void {
    this.loadFollowingIds();
    this.loadDefaultUsers();
    this.userService.followStateChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId, isFollowing }) => {
        if (isFollowing) {
          this.followingUserIds.add(userId);
        } else {
          this.followingUserIds.delete(userId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFollowingIds(): void {
    this.userService.getFollowingIds().subscribe({
      next: (ids) => {
        this.followingUserIds = new Set(ids.map((id) => String(id)));
      },
      error: (err) => console.error('Error loading following ids:', err)
    });
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
    const userId = String(user.id);

    if (this.followActionInProgress.has(userId)) return;

    const isFollowing = this.followingUserIds.has(userId);
    // optimistic UI update for real-time toggle
    if (isFollowing) {
      this.followingUserIds.delete(userId);
    } else {
      this.followingUserIds.add(userId);
    }
    this.followActionInProgress.add(userId);

    const action = isFollowing ? this.userService.unfollow(userId) : this.userService.follow(userId);
    action.subscribe({
      next: () => {
        this.userService.notifyFollowCountChange(isFollowing ? -1 : 1);
        this.userService.notifyFollowStateChange(userId, !isFollowing);
        this.followActionInProgress.delete(userId);
      },
      error: (err) => {
        this.userService.isFollowing(userId).subscribe({
          next: (serverIsFollowing) => {
            if (serverIsFollowing) {
              this.followingUserIds.add(userId);
            } else {
              this.followingUserIds.delete(userId);
            }
          },
          error: () => {
            // fallback rollback if status check fails
            if (isFollowing) {
              this.followingUserIds.add(userId);
            } else {
              this.followingUserIds.delete(userId);
            }
          },
          complete: () => {
            this.followActionInProgress.delete(userId);
          }
        });
        console.error('Follow toggle failed', err);
      }
    });
  }
}
