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
    this.userService.followStatusChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId, isFollowing }) => {
        if (isFollowing) {
          this.followingUserIds.add(String(userId));
        } else {
          this.followingUserIds.delete(String(userId));
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

  isFollowing(user: User): boolean {
    return this.followingUserIds.has(String(user.id));
  }

  toggleFollow(user: User, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const userId = String(user?.id ?? '');
    if (!user || !userId || this.followActionInProgress.has(userId)) return;

    this.followActionInProgress.add(userId);
    const currentlyFollowing = this.followingUserIds.has(userId);
    const action = currentlyFollowing ? this.userService.unfollow(userId) : this.userService.follow(userId);


    action.subscribe({
      next: () => {
        if (currentlyFollowing) {
          this.followingUserIds.delete(userId);
          user.followersCount = Math.max(0, (user.followersCount ?? 0) - 1);
          this.userService.notifyFollowCountChange(-1);
          this.userService.notifyFollowStatusChange(userId, false);
          this.userService.notifyFollowToast('Successfully unfollowed!', true);
        } else {
          this.followingUserIds.add(userId);
          user.followersCount = (user.followersCount ?? 0) + 1;
          this.userService.notifyFollowCountChange(1);
          this.userService.notifyFollowStatusChange(userId, true);
          this.userService.notifyFollowToast('Successfully followed!', true);
        }
        this.followActionInProgress.delete(userId);
      },
      error: (err) => {
        console.error('Error following/unfollowing user:', err);
        this.followActionInProgress.delete(userId);
      }
    });
  }
}
