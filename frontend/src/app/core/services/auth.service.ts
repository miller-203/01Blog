import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserLogin, UserRegister } from '../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.api.auth;

  constructor(private http: HttpClient, private router: Router) { }

  public register(userRegister: UserRegister): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userRegister).pipe(
      tap((response: any) => {
        const token = response?.token || response?.accessToken;
        if (token) {
          localStorage.setItem('access_token', token);
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  public login(userLogin: UserLogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userLogin).pipe(
      tap((response: any) => {
        const token = response?.token || response?.accessToken;
        if (token) {
          localStorage.setItem('access_token', token);
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  public refreshToken(): Observable<any> {
    return throwError(() => new Error('Refresh token endpoint is not available'));
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  public isAdmin(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'ADMIN';
    } catch {
      return false;
    }
  }

} 
