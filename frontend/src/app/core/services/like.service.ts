import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = environment.api.likes;
  private http = inject(HttpClient);
  
    toggleLike(postId: String): Observable<any> {
      return this.http.post(`${this.apiUrl}/${postId}`, {});
    }
}
