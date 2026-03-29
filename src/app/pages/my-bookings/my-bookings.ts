import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Booking, FirestoreService } from '../../services/firestore.service';

interface BookingRecord {
  id: string;
  activityTitle: string;
  travelDate: string;
  travelers: number;
  status: Booking['status'];
  createdAt?: Booking['createdAt'];
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly subscriptions = new Subscription();

  bookings: BookingRecord[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const bookingsSubscription = this.authService.user$
      .pipe(switchMap((user) => (user ? this.firestoreService.getUserBookings(user.uid) : of([] as Booking[]))))
      .subscribe({
        next: (bookings) => {
          this.bookings = [...bookings]
            .sort((a, b) => {
              const left = a.createdAt?.toMillis() ?? 0;
              const right = b.createdAt?.toMillis() ?? 0;
              return right - left;
            })
            .map((booking) => ({
              id: booking.id,
              activityTitle: booking.activityTitle || 'Tour Booking',
              travelDate: booking.travelDate,
              travelers: booking.travelers,
              status: booking.status,
              createdAt: booking.createdAt
            }));
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'We could not load your bookings right now.';
          this.isLoading = false;
        }
      });

    this.subscriptions.add(bookingsSubscription);
  }

  formatDate(value: string): string {
    if (!value) {
      return 'Date not provided';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }

  formatCreatedAt(value: Booking['createdAt'] | null): string {
    if (!value) {
      return 'Just now';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(value.toDate());
  }

  trackByBooking(index: number, booking: BookingRecord): string {
    return booking.id;
  }
}
