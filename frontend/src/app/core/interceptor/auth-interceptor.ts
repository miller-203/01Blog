import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const redirectToLogin = () => {
    authService.logout();
    router.navigate(['/login']);
  };

  // Skip auth endpoints
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorType = error.error?.error || '';

      if (error.status === 401 || error.status === 403) {
        if (error.status === 401 && errorType === 'JWT_EXPIRED') {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getAccessToken();

              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });

              return next(clonedRequest);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              redirectToLogin();
              return throwError(() => refreshError);
            })
          );
        }

        // JWT invalid, banned, disabled, unauthorized, forbidden
        redirectToLogin();
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};