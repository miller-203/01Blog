import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post';
import { jwtDecode } from 'jwt-decode';
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

  commentText: { [key: number]: string } = {};

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
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();

      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          this.username = decoded.sub;
          this.loadPosts();
          this.loadUsersToFollow();
          this.loadNotifications();
          this.refreshData();
        } catch (error) {
          console.error('Invalid token');
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }


  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data: any) => {
        // Handle different data formats (Page object vs List)
        const rawPosts = Array.isArray(data) ? data : data.content || [];

        // Prepare posts with extra fields for the UI
        this.posts = rawPosts.map((post: any) => ({
          ...post,
          showComments: false, // Is the chat box open?
          comments: []         // The list of comments
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading posts:', err)
    });
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;

    // If opening for the first time, fetch comments from server
    if (post.showComments && post.comments.length === 0) {
      this.postService.getComments(post.id).subscribe({
        next: (comments) => {
          post.comments = comments;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching comments', err)
      });
    }
  }

  submitComment(post: any) {
    const text = this.commentText[post.id];
    if (!text) return; // Don't send empty comments

    this.postService.addComment(post.id, text).subscribe({
      next: () => {
        // Refresh the comment list for this post
        this.postService.getComments(post.id).subscribe(newComments => {
          post.comments = newComments;
          this.commentText[post.id] = ''; // Clear the input box
          this.cdr.detectChanges();
        });
      },
      error: (err) => alert('Failed to post comment')
    });
  }

  // 👇 NEW: LIKE FUNCTION 👇
  likePost(post: any) {
    this.postService.toggleLike(post.id).subscribe({
      next: (response: any) => {
        // The backend returns: { liked: true/false, count: 12 }
        post.likedByCurrentUser = response.liked;
        post.likeCount = response.count;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error liking post', err)
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  usersToFollow: any[] = [];
  notifications: any[] = [];
  showNotifDropdown = false;
  unreadCount = 0;

  loadUsersToFollow() {
    this.userService.getAllUsers().subscribe(users => {
      // Filter out the current user
      this.usersToFollow = users.filter((u: any) => u.username !== this.username);
    });
  }

  followUser(user: any) {
    this.userService.followUser(user.id).subscribe(() => {
      alert(`You are now following ${user.username}`);
      this.loadUsersToFollow(); // Refresh list
    });
  }

  toggleNotifDropdown() {
    this.showNotifDropdown = !this.showNotifDropdown;
  }

  onNotifClick(notif: any) {
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
      this.unreadCount--;
      this.router.navigate(['/posts', notif.postId]);
      this.showNotifDropdown = false;
    });
  }
  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('Notifications received:', data); // <--- Add this log!
        this.notifications = data;
        this.unreadCount = data.filter((n: any) => !n.isRead).length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Notification error:', err)
    });
  }
  refreshData() {
    this.loadPosts();
    this.loadNotifications();
  }

  reportReason: { [key: number]: string } = {};

  reportUser(user: any) {
    const reason = (this.reportReason[user.id] || '').trim();
    if (!reason) {
      alert('Please provide a report reason');
      return;
    }

    this.reportService.reportUser(user.id, reason).subscribe({
      next: () => {
        alert(`Report submitted for ${user.username}`);
        this.reportReason[user.id] = "";
      },
      error: () => alert('Failed to submit report')
    });
  }
}

