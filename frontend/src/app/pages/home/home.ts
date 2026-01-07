import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- IMPORT THIS
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post'; // Check your filename (post.service or post)
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <--- ADD HERE
  templateUrl: './home.html', // Keep your existing filename
  styleUrls: ['./home.scss']  // Keep your existing filename
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          this.username = decoded.sub;
          this.loadPosts();
        } catch (error) {
          console.error('Invalid token');
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data: any) => {
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

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}