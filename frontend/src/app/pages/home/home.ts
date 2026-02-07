import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post'; // Ensure filename matches
import { jwtDecode } from 'jwt-decode';
import { TimeAgoPipe } from '../../pipes/time-ago-pipe'; // <--- 1. Import TimeAgoPipe
// Add UserService and NotificationService to your imports
import { UserService } from '../../service/user'; // Create if needed
import { NotificationService } from '../../service/notification';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TimeAgoPipe], // <--- 2. Add TimeAgoPipe here
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  username: string = 'User';
  posts: any[] = [];

  // Stores text for each post's comment input: { postId: "text..." }
  commentText: { [key: number]: string } = {};

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

 ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    const token = this.authService.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.username = decoded.sub;

        // ✅ MOVE ALL DATA LOADING HERE
        // These only run if a valid token exists
        this.loadPosts();
        this.loadUsersToFollow();
        this.loadNotifications();
        
      } catch (error) {
        console.error('Invalid token');
        this.router.navigate(['/login']);
      }
    } else {
      // No token found, go to login
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

  loadNotifications() {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
      this.unreadCount = data.filter((n: any) => !n.isRead).length;
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
}

