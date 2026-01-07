import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth'; 

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper (Used for Create/Get)
  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // 1. Create a Post
  createPost(title: string, content: string, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post(this.apiUrl, formData, this.getHeaders());
  }

  // 2. Get All Posts
  getAllPosts(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // 3. Delete Post
  deletePost(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: headers, 
      responseType: 'text'
    });
  }

  // 4. Update Post (FIXED VERSION)
  updatePost(id: number, title: string, content: string): Observable<any> {
    const token = localStorage.getItem('token');
    // Manually create headers here to avoid Type Mismatch error
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const postData = { title, content };
    
    // Correct syntax: { headers: headers }
    return this.http.put(`${this.apiUrl}/${id}`, postData, { headers: headers });
  }
  // 5. Get Comments for a Post
  getComments(postId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/comments/${postId}`, this.getHeaders());
  }

  // 6. Add a Comment
  // 6. Add a Comment (Fixed for Text Response)
  addComment(postId: number, content: string): Observable<any> {
    const payload = { postId, content };
    
    // We get the token headers manually
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `http://localhost:8080/api/comments`, 
      payload, 
      { 
        headers: headers, 
        responseType: 'text' // <--- THIS FIXES THE ERROR
      }
    );
  }
}