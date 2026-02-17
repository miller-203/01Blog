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
    const formData = new FormData();
    formData.append('username', userRegister.username);
    formData.append('firstName', userRegister.firstName || '');
    formData.append('lastName', userRegister.lastName || '');
    formData.append('email', userRegister.email);
    formData.append('password', userRegister.password);
    if (userRegister.avatar) {
      formData.append('avatar', userRegister.avatar);
    }

    return this.http.post(`${this.apiUrl}/register`, formData).pipe(
      tap((response: any) => {
        const token = response?.token || response?.accessToken;
        if (token) {
          localStorage.setItem('access_token', token);
        }
        if (response?.role) {
          localStorage.setItem('user_role', response.role);
        }
        if (response?.status) {
          localStorage.setItem('user_status', response.status);
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
        if (response?.role) {
          localStorage.setItem('user_role', response.role);
        }
        if (response?.status) {
          localStorage.setItem('user_status', response.status);
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
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_status');
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
    const role = (localStorage.getItem('user_role') || '').toUpperCase();
    const status = (localStorage.getItem('user_status') || '').toUpperCase();
    return (role === 'ADMIN' || role === 'ROLE_ADMIN') && status === 'ACTIVE';
  }

} 
