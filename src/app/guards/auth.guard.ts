import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.whenReady();

  if (authService.canAccessProtectedRoutes()) {
    return true;
  }

  if (authService.currentUser && authService.requiresEmailVerification()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        redirectTo: state.url,
        mode: 'login',
        verifyEmail: '1'
      }
    });
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url }
  });
};
