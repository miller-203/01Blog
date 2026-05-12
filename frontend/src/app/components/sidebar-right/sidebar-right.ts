import { Component, HostBinding, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popup } from '../../components/popup/popup';
import { Subject, takeUntil } from 'rxjs';




@Component({
  selector: 'app-sidebar-right',
  imports: [CommonModule, FormsModule, Popup],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.scss'
})
export class SidebarRight implements OnInit, OnDestroy {
  @Input() isOpenInput = false;
  @ViewChild('popup') popup!: Popup;

  @HostBinding('class.open')
  get isOpenClass() {
    return this.isOpenInput;
  }

  searchQuery = '';
  users: User[] = [];
  displayedUsers: User[] = [];
  displayedCount = 10;
  readonly pageSize = 10;
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
      .subscribe((event) => this.applyFollowStateChange(event.targetUserId, event.isFollowing));
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
        this.displayedCount = this.pageSize;
        this.displayedUsers = this.users.slice(0, this.displayedCount);
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

  loadMoreUsers(): void {
    this.displayedCount += this.pageSize;
    this.displayedUsers = this.users.slice(0, this.displayedCount);
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
        this.applyFollowStateChange(userId, !currentlyFollowing);
        this.userService.notifyFollowCountChange(currentlyFollowing ? -1 : 1);
        this.userService.notifyFollowStateChange({ targetUserId: userId, isFollowing: !currentlyFollowing });
        this.popup.show(currentlyFollowing ? 'Successfully unfollowed!' : 'Successfully followed!', true);
        this.followActionInProgress.delete(userId);
      },
      error: (err) => {
        console.error('Error following/unfollowing user:', err);
        this.popup.show('Error following/unfollowing user!', false);
        this.followActionInProgress.delete(userId);
      }
    });
  }

  private applyFollowStateChange(userId: string, isFollowing: boolean): void {
    const wasFollowing = this.followingUserIds.has(userId);
    if (isFollowing === wasFollowing) return;

    if (isFollowing) {
      this.followingUserIds.add(userId);
    } else {
      this.followingUserIds.delete(userId);
    }

    const user = this.users.find((u) => String(u.id) === userId);
    if (!user) return;

    const delta = isFollowing ? 1 : -1;
    user.followersCount = Math.max(0, (user.followersCount ?? 0) + delta);
  }
}
