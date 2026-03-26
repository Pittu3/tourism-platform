import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Booking, FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly router = inject(Router);

  readonly user$ = this.authService.user$;
  readonly displayName$ = this.user$.pipe(
    map((user) => user?.displayName?.trim() || user?.email || 'Traveler')
  );
  readonly bookings$ = this.user$.pipe(
    switchMap((user) => (user ? this.firestoreService.getUserBookings(user.uid) : of([] as Booking[])))
  );

  loggingOut = false;
  errorMessage = '';

  async logout(): Promise<void> {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.errorMessage = '';

    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to logout right now. Please try again.';
    } finally {
      this.loggingOut = false;
    }
  }
}
