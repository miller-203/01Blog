import { Component, HostBinding, Input, inject, OnInit, ErrorHandler } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popup } from '../../components/popup/popup';


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
  followActionInProgress = new Set<string>();
  isLoading: boolean = false;
  isFollowing: boolean = false;
  popup!: Popup;


  private userService = inject(UserService);

  ngOnInit(): void {
    this.loadFollowingIds();
    this.loadDefaultUsers();
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

checkFollowStatus(user: User): void {
    if (!user) return;
    this.userService.isFollowing(user.id).subscribe({
      next: (isFollowing) => {
        this.isFollowing = isFollowing;
      },
      error: (err) => {
        console.error('Error checking follow status:', err);
      }
    });
  }

  toggleFollow(user: User, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!user || this.isLoading) return;


    this.isLoading = true;
    const action = this.isFollowing ? this.userService.unfollow(user.id) : this.userService.follow(user.id);


    action.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        // Update follower count
        if (this.isFollowing) {
          user!.followersCount++;
          this.userService.notifyFollowCountChange(1);
          this.popup.show('Successfully followed!', true);
        } else {
          user!.followersCount--;
          this.userService.notifyFollowCountChange(-1);
          this.popup.show('Successfully unfollowed!', true);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error following/unfollowing user:', err);
        // this.popup.show(ErrorHandler.extractErrorMessage(err), false);
        this.isLoading = false;
      }
    });
  }
}
