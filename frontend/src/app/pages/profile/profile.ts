import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post'; // Ensure filename matches
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- 1. IMPORT THIS

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <--- 2. ADD HERE
  templateUrl: './profile.html', // Ensure this matches your file name
  styleUrls: ['./profile.scss']   // Ensure this matches your file name
})
export class ProfileComponent implements OnInit {

  userProfile: any = null;
  myPosts: any[] = [];

  // Edit variables
  editingPostId: number | null = null;
  editTitle: string = '';
  editContent: string = '';

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
      this.loadMyPosts();
    }
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadMyPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data: any) => {
        const allPosts = Array.isArray(data) ? data : data.content;
        this.myPosts = allPosts; 
        this.cdr.detectChanges();
      }
    });
  }

  deletePost(postId: number) {
    if(confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.myPosts = this.myPosts.filter(p => p.id !== postId);
          this.cdr.detectChanges(); 
          alert('Post deleted!');
        },
        error: (err) => {
          console.error(err);
          alert('Could not delete post.');
        }
      });
    }
  }

  startEditing(post: any) {
    this.editingPostId = post.id;
    this.editTitle = post.title;
    this.editContent = post.content;
  }

  cancelEdit() {
    this.editingPostId = null;
  }

  saveEdit() {
    if (this.editingPostId) {
      this.postService.updatePost(this.editingPostId, this.editTitle, this.editContent).subscribe({
        next: () => {
          const post = this.myPosts.find(p => p.id === this.editingPostId);
          if (post) {
            post.title = this.editTitle;
            post.content = this.editContent;
          }
          this.editingPostId = null;
          this.cdr.detectChanges(); // Force update so text changes on screen
          alert('Post updated!');
        },
        error: (err) => console.error(err)
      });
    }
  }
}