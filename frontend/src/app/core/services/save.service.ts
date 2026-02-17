import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class SaveService {
  private apiUrl = environment.api.saved;
  private http = inject(HttpClient);

  toggleSave(postId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { postId });
  }

  getSavedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      map((posts: any[]) => posts.map(post => ({
        ...post,
        authorId: post.authorId ?? post.userId,
        authorUsername: post.authorUsername ?? post.username,
        authorName: post.authorName ?? post.username,
        likesCount: post.likesCount ?? post.likeCount ?? 0,
        liked: post.liked ?? post.likedByCurrentUser ?? false,
        saved: post.saved ?? post.savedByCurrentUser ?? true
      })))
    );
  }
}
