import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { SidebarLeft } from '../../../components/sidebar-left/sidebar-left';
import { PostService } from '../../../core/services/post.service';
import { PostCard } from '../../../components/post-card/post-card';
import { parseEditorJsContent } from '../../../core/utils/editorjs-parser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Popup } from '../../../components/popup/popup';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, SidebarLeft, PostCard, Popup],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, AfterViewInit {
  posts: any[] = [];
  currentPage = 0;
  pageSize = 5;
  isLoading = false;
  hasMorePosts = true;
  currentFilter: 'all' | 'followed' = 'all';
  showCreatePopup = false;
  newPostTitle = '';
  newPostContent = '';

  @ViewChild('popup') popup!: Popup;

  private postService = inject(PostService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadPosts();
  }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'post-created') {
        this.popup.show('Post created successfully.', true);
      } else if (params['success'] === 'post-deleted') {
        this.popup.show('Post deleted successfully.', true);
      } else if (params['success'] === 'post-notFound') {
        this.popup.show('Post not found or access denied.', false);
      }
    });
  }

  loadPosts(): void {
    if (this.isLoading || !this.hasMorePosts) return;

    this.isLoading = true;
    const serviceMethod = this.currentFilter === 'followed'
      ? this.postService.getFollowedPosts(this.currentPage, this.pageSize)
      : this.postService.getAllPosts(this.currentPage, this.pageSize);

    serviceMethod.subscribe({
      next: (res: any[]) => {
        if (res.length === 0) {
          this.hasMorePosts = false;
        } else {
          const newPosts = res.map(post => ({
            ...post,
            parsedContent: parseEditorJsContent(post.content)
          }));
          this.posts = [...this.posts, ...newPosts];
          this.currentPage++;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch posts', err);
        this.isLoading = false;
      }
    });
  }

  loadMorePosts(): void {
    this.loadPosts();
  }

  switchFilter(filter: 'all' | 'followed'): void {
    if (this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.posts = [];
    this.currentPage = 0;
    this.hasMorePosts = true;
    this.loadPosts();
  }

  openCreatePopup(): void {
    this.showCreatePopup = true;
  }

  closeCreatePopup(): void {
    this.showCreatePopup = false;
    this.newPostTitle = '';
    this.newPostContent = '';
  }

  createPostFromPopup(): void {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) return;

    this.postService.createPost({
      title: this.newPostTitle.trim(),
      content: this.newPostContent.trim()
    }).subscribe({
      next: () => {
        this.closeCreatePopup();
        this.posts = [];
        this.currentPage = 0;
        this.hasMorePosts = true;
        this.loadPosts();
        this.popup.show('Post created successfully.', true);
      },
      error: (err) => {
        console.error('Create post failed', err);
        this.popup.show('Failed to create post.', false);
      }
    });
  }
}
