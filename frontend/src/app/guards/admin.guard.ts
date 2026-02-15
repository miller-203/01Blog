import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const role = authService.getRole();

  // If role was not stored (older sessions), allow access and let backend enforce admin auth.
  if (!role) {
    return true;
  }

  if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
    return true;
  }

  return router.createUrlTree(['/home']);
};
