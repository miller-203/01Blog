import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentRequest, CommentLikeRequest, CommentLikeResponse } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.comments;

  getCommentsByPostId(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`);
  }

  createComment(postId: string, commentRequest: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}`, commentRequest);
  }

  toggleCommentLike(commentLikeRequest: CommentLikeRequest): Observable<CommentLikeResponse> {
    return this.http.post<CommentLikeResponse>(`${this.apiUrl}/like`, commentLikeRequest);
  }

  getCommentLikeStatus(commentId: string): Observable<CommentLikeResponse> {
    return this.http.get<CommentLikeResponse>(`${this.apiUrl}/like`, { params: { commentId } });
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}
