import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
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
      savesCount: post.savesCount ?? 0,
      liked: post.liked ?? post.likedByCurrentUser ?? false,
      saved: post.saved ?? post.savedByCurrentUser ?? false
    };
  }

  getAllPosts(page: number = 0, size: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      map(posts => posts.map(post => this.mapPost(post)))
    );
  }

  getFollowedPosts(page: number = 0, size: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feed?page=${page}&size=${size}`).pipe(
      map(posts => posts.map(post => this.mapPost(post)))
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

  deletePost(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  togglePostVisibility(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/toggle-hide`, {});
  }

  deletePostFromUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  createPost(postData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, postData);
  }

  updatePost(id: string, postData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, postData);
  }
}
