import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = async (_, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (!sessionService.currentUser) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url }
    });
  }

  const { auth } = await import('../firebase/firebase');

  await auth.authStateReady();

  if (auth.currentUser?.email) {
    sessionService.setUser({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    });
    return true;
  }

  sessionService.clearUser();

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url }
  });
};
