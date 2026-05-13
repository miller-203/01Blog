import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../core/models/post';
import { RouterLink } from '@angular/router';
import { ConfirmDeletePopup } from '../../../components/confirm-delete-popup/confirm-delete-popup';
import { Popup } from '../../../components/popup/popup';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-posts',
  imports: [CommonModule, RouterLink, ConfirmDeletePopup, Popup],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss'
})
export class AdminPosts implements OnInit {
  @ViewChild('popup') popup!: Popup;
  private adminService = inject(AdminService);
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  displayedPosts: Post[] = [];
  searchTerm = '';
  currentPage: number = 0;
  pageSize: number = 10;
  isLoading: boolean = false;
  hasMorePosts: boolean = true;
  showDeletePopup = false;
  postToDelete: Post | null = null;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    if (this.isLoading || !this.hasMorePosts) return;

    this.isLoading = true;
    this.adminService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.hasMorePosts = false;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.popup.show('Failed to load posts. Please try again.', false);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = post.authorUsername?.toLowerCase().includes(this.searchTerm) ||
        post.authorName?.toLowerCase().includes(this.searchTerm);
      return matchesSearch;
    });
    this.displayedPosts = this.filteredPosts;
  }

  loadMore() {
    // kept for template compatibility (admin list loads all posts at once)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewPost(post: Post) {
  }

  deletePost(post: Post) {
    this.postToDelete = post;
    this.showDeletePopup = true;
  }

  confirmDeletePost() {
    if (this.postToDelete) {
      this.adminService.deletePost(this.postToDelete.id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== this.postToDelete!.id);
          this.applyFilters();
          this.showDeletePopup = false;
          this.postToDelete = null;
          this.popup.show('Post deleted successfully.', true);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.popup.show('Failed to delete post. Please try again.', false);
          this.showDeletePopup = false;
          this.postToDelete = null;
        }
      });
    }
  }

  cancelDeletePost() {
    this.showDeletePopup = false;
    this.postToDelete = null;
  }

  togglePostVisibility(post: Post) {
    this.adminService.togglePostVisibility(post.id).subscribe({
      next: (updatedPost) => {
        post.hidden = (updatedPost.status ?? '').toUpperCase() === 'HIDDEN';
        const message = post.hidden ? 'Post hidden successfully.' : 'Post unhidden successfully.';
        this.popup.show(message, true);
      },
      error: (error: any) => {
        console.error('Error toggling post visibility:', error);
        this.popup.show('Failed to toggle post visibility. Please try again.', false);
      }
    });
  }
}
