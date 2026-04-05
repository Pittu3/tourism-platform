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
      .pipe(
        switchMap((user) =>
          user ? this.firestoreService.getUserBookings(user.uid, user.email) : of([] as Booking[])
        )
      )
      .subscribe({
        next: (bookings) => {
          this.bookings = [...bookings]
            .sort((a, b) => {
              const left = this.resolveSortTimestamp(a);
              const right = this.resolveSortTimestamp(b);
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
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return 'Date not provided';
    }

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return 'Date not provided';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(parsed);
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

  getStatusMeta(booking: BookingRecord): { label: string; className: string } {
    if (booking.status === 'cancelled') {
      return {
        label: 'Cancelled',
        className: 'status-cancelled'
      };
    }

    const travelDate = new Date(`${booking.travelDate}T00:00:00`);
    if (Number.isNaN(travelDate.getTime())) {
      return {
        label: booking.status,
        className: 'status-generic'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travelDate < today) {
      return {
        label: 'Completed',
        className: 'status-completed'
      };
    }

    const daysUntilTrip = Math.ceil((travelDate.getTime() - today.getTime()) / 86400000);
    if (daysUntilTrip <= 7) {
      return {
        label: `In ${daysUntilTrip}d`,
        className: 'status-soon'
      };
    }

    return {
      label: 'Upcoming',
      className: 'status-upcoming'
    };
  }

  private resolveSortTimestamp(booking: Booking): number {
    if (booking.createdAt) {
      return booking.createdAt.toMillis();
    }

    if (booking.travelDate && /^\d{4}-\d{2}-\d{2}$/.test(booking.travelDate)) {
      const parsed = new Date(`${booking.travelDate}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.getTime();
      }
    }

    return 0;
  }
}
