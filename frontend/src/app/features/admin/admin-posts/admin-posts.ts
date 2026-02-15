import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post';
import { RouterLink } from '@angular/router';
import { ConfirmDeletePopup } from '../../../components/confirm-delete-popup/confirm-delete-popup';
import { Popup } from '../../../components/popup/popup';

@Component({
  selector: 'app-admin-posts',
  imports: [CommonModule, RouterLink, ConfirmDeletePopup, Popup],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss'
})
export class AdminPosts implements OnInit {
  @ViewChild('popup') popup!: Popup;
  private postService = inject(PostService);
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
    this.postService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (posts) => {
        if (posts.length === 0) {
          this.hasMorePosts = false;
        } else {
          this.posts = [...this.posts, ...posts];
          this.currentPage++;
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
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
    this.loadPosts();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewPost(post: Post) {
    console.log('View post:', post.id);
  }

  deletePost(post: Post) {
    this.postToDelete = post;
    this.showDeletePopup = true;
  }

  confirmDeletePost() {
    if (this.postToDelete) {
      this.postService.deletePost(this.postToDelete.id).subscribe({
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
    this.postService.togglePostVisibility(post.id).subscribe({
      next: () => {
        post.hidden = !post.hidden;
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
