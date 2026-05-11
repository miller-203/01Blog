import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { PostService } from '../../../core/services/post.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Post } from '../../../core/models/post';
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../../core/services/utils/DateUtil.service';
import { parseEditorJsContent } from '../../../core/utils/editorjs-parser';
import { Comment, CommentRequest, CommentLikeRequest } from '../../../core/models/comment';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { ReportUserPopup } from '../../../components/report-user-popup/report-user-popup';
import { ConfirmDeletePopup } from '../../../components/confirm-delete-popup/confirm-delete-popup';
import { Popup } from '../../../components/popup/popup';
import { ErrorHandler } from '../../../core/utils/error-handler';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, FormsModule, ReportUserPopup, RouterLink, ConfirmDeletePopup, Popup],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss']
})
export class PostDetail implements OnInit {
  // Properties
  post!: any;
  createdAt?: string;
  comments: Comment[] = [];
  @ViewChild('popup') popup!: Popup;
  newCommentContent: string = '';
  showComments: boolean = false;
  showMenu: boolean = false;
  showReportPopup: boolean = false;
  showDeletePopup: boolean = false;
  postToDelete: Post | null = null;
  reportForm = { reason: '' };
  authorAvatar: string | null = null;

  // Injected Services
  postService = inject(PostService);
  likeService = inject(LikeService);
  commentService = inject(CommentService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dateUtils = inject(DateUtilsService);
  reportService = inject(ReportService);
  userService = inject(UserService);

  currentUserId: string | null = null;

  // Lifecycle Hook
  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.currentUserId = user.id,
      error: (error) => console.error('Error loading current user in post detail:', error)
    });

    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.router.navigate(['/home']);
      this.popup.show('Post not found.', false);
      return;
    }

    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        if (!post) {
          this.router.navigate(['/home']);
          this.popup.show('Post not found.', false);
          return;
        }

        this.post = {
          ...post,
          parsedContent: parseEditorJsContent(post.content)
        };
        this.authorAvatar = this.normalizeAvatar(this.post.authorAvatar ?? this.post.authorImage ?? this.post.avatarUrl ?? null);
        this.createdAt = this.dateUtils.formatDate(post.createdAt);
        console.log('Post details:', this.post);
      },
      error: (error) => {
        console.error('Error fetching post details:', error);
        this.router.navigate(['/home'], { queryParams: { success: 'post-notFound' } });
      }
    });
  }

  // ===== POST ACTIONS =====
  onLike(): void {
    if (!this.post) return;
    this.likeService.toggleLike(this.post.id).subscribe({
      next: (res: any) => {
        if (this.post) {
          this.post.liked = res.liked;
          this.post.likesCount = res.likesCount ?? res.count;
        }
      },
      error: (err) => {
        console.error('Like error', err);
        this.popup.show(ErrorHandler.extractErrorMessage(err), false);
      }
    });
  }

  onEdit() {
    const postId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/edit-post', postId]);
    this.showMenu = false;
  }

  onDelete(post: Post) {
    this.postToDelete = post;
    this.showDeletePopup = true;
    this.showMenu = false;
  }

  confirmDeletePost() {
    if (this.postToDelete) {
      this.postService.deletePost(this.postToDelete.id).subscribe({
        next: () => {
          this.showDeletePopup = false;
          this.postToDelete = null;
          this.router.navigate(['/home'], { queryParams: { success: 'post-deleted' } });
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.popup.show(ErrorHandler.extractErrorMessage(error), false);
        }
      });
    }
  }

  cancelDeletePost() {
    this.showDeletePopup = false;
    this.postToDelete = null;
  }

  // ===== COMMENT ACTIONS =====
  onCommentClick() {
    if (!this.showComments) {
      this.loadComments();
    }
    this.showComments = !this.showComments;
  }

  loadComments() {
    const postId = this.route.snapshot.paramMap.get('id');
    this.commentService.getCommentsByPostId(postId!).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.comments.forEach(comment => {
          this.commentService.getCommentLikeStatus(comment.id).subscribe({
            next: (likeStatus) => {
              comment.liked = likeStatus.liked;
              comment.likesCount = likeStatus.likesCount;
            },
            error: (err) => {
              console.error('Error fetching comment like status', err);
              this.popup.show(ErrorHandler.extractErrorMessage(err), false);
            }
          });
        });
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
        this.popup.show(ErrorHandler.extractErrorMessage(error), false);
      }
    });
  }

  onSubmitComment() {
    if (!this.newCommentContent.trim()) return;

    const postId = this.route.snapshot.paramMap.get('id');
    const commentRequest: CommentRequest = { content: this.newCommentContent };

    this.commentService.createComment(postId!, commentRequest).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment);
        newComment.owner = true;
        this.newCommentContent = '';
        if (this.post) {
          this.post.commentsCount = (this.post.commentsCount || 0) + 1;
        }
        this.popup.show("Your comment has been created.", true);
      },
      error: (error) => {
        console.error('Error creating comment:', error);
        this.popup.show(ErrorHandler.extractErrorMessage(error), false);
      }
    });
  }

  onLikeComment(comment: Comment) {
    const likeRequest: CommentLikeRequest = { commentId: comment.id };
    this.commentService.toggleCommentLike(likeRequest).subscribe({
      next: (res) => {
        comment.liked = res.liked;
        comment.likesCount = res.likesCount;
      },
      error: (err) => console.error('Comment like error', err)
    });
  }

  onDeleteComment(comment: Comment) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(comment.id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== comment.id);
          if (this.post) {
            this.post.commentsCount = (this.post.commentsCount || 0) - 1;
          }
          this.popup.show("Your comment has been deleted.", true);
        },
        error: (err) => {
          console.error('Comment delete error', err);
          this.popup.show(ErrorHandler.extractErrorMessage(err), false);
        }
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    if (typeof comment.canDelete === 'boolean') {
      return comment.canDelete;
    }
    return comment.owner || (!!this.currentUserId && String(comment.authorId) === String(this.currentUserId));
  }

  // ===== REPORT ACTIONS =====
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  onReportClick() {
    this.showReportPopup = true;
    this.showMenu = false;
  }

  closeReportPopup() {
    this.showReportPopup = false;
  }

  submitReportPost() {
    if (!this.post || !this.reportForm.reason.trim()) return;

    this.reportService.reportPost(this.post.id, this.reportForm.reason).subscribe({
      next: () => {
        this.popup.show("Report submitted successfully!", true);
        this.closeReportPopup();
        this.reportForm.reason = '';
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        this.popup.show(ErrorHandler.extractErrorMessage(err), false);
      }
    });
  }
  private normalizeAvatar(value: unknown): string | null {
    const avatar = String(value ?? '').trim();
    if (!avatar || avatar.toLowerCase() === 'false' || avatar.toLowerCase() === 'null') {
      return null;
    }
    if (/^https?:\/\//i.test(avatar) || avatar.startsWith('/')) {
      return avatar;
    }

    const origin = environment.apiUrl.replace(/\/api\/?$/, '');
    const normalizedPath = avatar.startsWith('uploads/') ? avatar : `uploads/${avatar}`;
    return `${origin}/${normalizedPath}`;
  }
}
