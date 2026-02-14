import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post';
import { TimeAgoPipe } from '../../pipes/time-ago-pipe';
import { UserService } from '../../service/user';
import { NotificationService } from '../../service/notification';
import { ReportService } from '../../service/report';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TimeAgoPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  username: string = 'User';
  posts: any[] = [];
  usersToFollow: any[] = [];
  notifications: any[] = [];
  showNotifDropdown = false;
  unreadCount = 0;

  commentText: { [key: number]: string } = {};
  reportReason: { [key: number]: string } = {};
  postReportReason: { [key: number]: string } = {};
  followingIds = new Set<number>();
  blockedIds = new Set<number>();

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private notificationService: NotificationService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      this.username = decoded.sub;
      this.refreshData();
    } catch {
      console.error('Invalid token');
      this.router.navigate(['/login']);
    }
  }

  private getErrorMessage(err: any, fallback: string) {
    return err?.error?.message || err?.error || fallback;
  }

  refreshData() {
    this.loadPosts();
    this.loadNotifications();
    this.loadBlockedUsers();
    this.loadFollowingIds();
    this.loadUsersToFollow();
  }

  loadPosts() {
    this.postService.getFeedPosts().subscribe({
      next: (data: any) => {
        const rawPosts = Array.isArray(data) ? data : data.content || [];
        this.posts = rawPosts.map((post: any) => ({
          ...post,
          showComments: false,
          comments: []
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading posts:', err)
    });
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;

    if (post.showComments && post.comments.length === 0) {
      this.postService.getComments(post.id).subscribe({
        next: (comments) => {
          post.comments = comments;
          this.cdr.detectChanges();
        },
        error: () => alert('Unable to load comments for this post.')
      });
    }
  }

  submitComment(post: any) {
    const text = this.commentText[post.id];
    if (!text) return;

    this.postService.addComment(post.id, text).subscribe({
      next: () => {
        this.postService.getComments(post.id).subscribe(newComments => {
          post.comments = newComments;
          this.commentText[post.id] = '';
          this.cdr.detectChanges();
        });
      },
      error: () => alert('Failed to post comment')
    });
  }

  likePost(post: any) {
    this.postService.toggleLike(post.id).subscribe({
      next: (response: any) => {
        post.likedByCurrentUser = response.liked;
        post.likeCount = response.count;
        this.cdr.detectChanges();
      },
      error: () => alert('Failed to like post.')
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadUsersToFollow() {
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.usersToFollow = users.filter((u: any) => !this.blockedIds.has(u.id));
      },
      error: () => alert('Failed to load suggested users.')
    });
  }

  loadFollowingIds() {
    this.userService.getFollowingIds().subscribe({
      next: ids => {
        this.followingIds = new Set(ids);
      },
      error: () => {
        this.followingIds = new Set();
      }
    });
  }

  isFollowing(userId: number) {
    return this.followingIds.has(userId);
  }

  toggleFollow(user: any) {
    if (this.isFollowing(user.id)) {
      this.userService.unfollowUser(user.id).subscribe({
        next: () => {
          this.followingIds.delete(user.id);
          this.cdr.detectChanges();
        },
        error: (err) => alert(this.getErrorMessage(err, 'Failed to unsubscribe user.'))
      });
      return;
    }

    this.userService.followUser(user.id).subscribe({
      next: () => {
        this.followingIds.add(user.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(this.getErrorMessage(err, 'Failed to follow user.'))
    });
  }

  loadBlockedUsers() {
    this.userService.getBlockedUserIds().subscribe({
      next: ids => {
        this.blockedIds = new Set(ids);
      },
      error: () => {
        this.blockedIds = new Set();
      }
    });
  }

  isBlocked(userId: number) {
    return this.blockedIds.has(userId);
  }

  toggleBlock(user: any) {
    if (this.isBlocked(user.id)) {
      this.userService.unblockUser(user.id).subscribe({
        next: () => {
          this.blockedIds.delete(user.id);
          this.loadUsersToFollow();
          this.cdr.detectChanges();
        },
        error: (err) => alert(this.getErrorMessage(err, 'Failed to unblock user.'))
      });
      return;
    }

    this.userService.blockUser(user.id).subscribe({
      next: () => {
        this.blockedIds.add(user.id);
        this.followingIds.delete(user.id);
        this.usersToFollow = this.usersToFollow.filter(u => u.id !== user.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(this.getErrorMessage(err, 'Failed to block user.'))
    });
  }

  toggleNotifDropdown() {
    this.showNotifDropdown = !this.showNotifDropdown;
  }

  onNotifClick(notif: any) {
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.showNotifDropdown = false;
      this.loadNotifications();
    });
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter((n: any) => !n.isRead).length;
        this.cdr.detectChanges();
      },
      error: () => console.error('Notification error')
    });
  }


  reportPost(post: any) {
    const reason = (this.postReportReason[post.id] || '').trim();
    if (!reason) {
      alert('Please provide a reason for reporting this post.');
      return;
    }

    const reportedUserId = post.userId || post.user?.id;
    if (!reportedUserId) {
      alert('Unable to identify post author for report.');
      return;
    }

    this.reportService.reportUser(reportedUserId, reason).subscribe({
      next: () => {
        alert('Post report submitted successfully.');
        this.postReportReason[post.id] = '';
      },
      error: (err) => alert(this.getErrorMessage(err, 'Failed to submit post report'))
    });
  }

  reportUser(user: any) {
    const reason = (this.reportReason[user.id] || '').trim();
    if (!reason) {
      alert('Please provide a report reason');
      return;
    }

    this.reportService.reportUser(user.id, reason).subscribe({
      next: () => {
        alert(`Report submitted for ${user.username}`);
        this.reportReason[user.id] = '';
      },
      error: (err) => alert(this.getErrorMessage(err, 'Failed to submit report'))
    });
  }
}
