import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip auth endpoints
  if (req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Add token to request
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
      if (error.status === 401) {
        const errorType = error.error?.error || '';

        if (errorType === 'JWT_EXPIRED') {
          
          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              
              // Retry the original request with new token
              const newToken = authService.getAccessToken();
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(clonedRequest);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              // Check if refresh token expired
              const refreshErrorType = refreshError.error?.error || '';
              
              if (refreshErrorType === 'REFRESH_TOKEN_EXPIRED') {
              } else {
              }
              
              // Logout user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } 
        // If JWT is invalid or any other 401 error
        else {
          authService.logout();
          return throwError(() => error);
        }
      }

      return throwError(() => error);
    })
  );
};
