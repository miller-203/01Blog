import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth'; // Import your Auth Service

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper to get the token header
  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // 1. Create a Post
  // 1. Create a Post (Supports Images)
  createPost(title: string, content: string, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    // Note: Do NOT set 'Content-Type' header manually for FormData. 
    // Angular/Browser does it automatically with the correct boundary.
    return this.http.post(this.apiUrl, formData, this.getHeaders());
  }

  // 2. Get All Posts
  getAllPosts(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }
}