import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }
}
