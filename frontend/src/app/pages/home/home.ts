import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <--- Import isPlatformBrowser
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html', 
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  username: string = 'User';
  posts: any[] = [];

  constructor(
    private authService: AuthService, 
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // <--- Inject Platform ID
  ) {}

  ngOnInit(): void {
    // 1. Check if we are in the Browser (Server doesn't have tokens)
    if (isPlatformBrowser(this.platformId)) {
      
      const token = this.authService.getToken();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          this.username = decoded.sub;
        } catch (error) {
          console.error('Invalid token');
        }
        
        // Only load posts if we are in the browser AND have a token
        this.loadPosts();

      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.posts = data;
        } else if (data.content) {
          this.posts = data.content;
        } else {
          this.posts = [];
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('❌ Error loading posts:', err);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}