import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PostService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.posts;

  private mapPost(post: any): any {
    return {
      ...post,
      authorId: post.authorId ?? post.userId,
      authorUsername: post.authorUsername ?? post.username,
      authorName: post.authorName ?? post.username,
      authorAvatar: post.authorAvatar ?? post.avatarUrl,
      likesCount: post.likesCount ?? post.likeCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
      liked: post.liked ?? post.likedByCurrentUser ?? false
    };
  }

  private paginate(posts: any[], page: number, size: number): any[] {
    const start = Math.max(0, page * size);
    return posts.slice(start, start + size);
  }

  getAllPosts(page: number = 0, size: number = 10): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts => this.paginate(posts, page, size).map(post => this.mapPost(post)))
    );
  }

  getFollowedPosts(page: number = 0, size: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feed`).pipe(
      map(posts => this.paginate(posts, page, size).map(post => this.mapPost(post)))
    );
  }

  getPostById(id: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(post => this.mapPost(post)));
  }

  getPostsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(posts => posts.map(post => this.mapPost(post)))
    );
  }

  deletePost(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  togglePostVisibility(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/toggle-hide`, {});
  }

  deletePostFromUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  createPost(postData: any): Observable<any> {
    const formData = new FormData();
    formData.append('title', postData.title || '');
    formData.append('content', postData.content || '');
    if (postData.file) {
      formData.append('file', postData.file);
    }
    return this.http.post<any>(this.apiUrl, formData);
  }

  updatePost(id: string, postData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, postData);
  }
}
