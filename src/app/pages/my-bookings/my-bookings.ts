import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { AuthService } from '../../core/services/auth.service';
import { firestore } from '../../core/firebase/firebase';

interface BookingRecord {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
  createdAt: Timestamp | null;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  bookings: BookingRecord[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private readonly authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    await this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    const user = this.authService.currentUser;

    if (!user) {
      this.errorMessage = 'Please sign in to view your bookings.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const bookingsQuery = query(
        collection(firestore, 'bookings'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(bookingsQuery);

      this.bookings = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: typeof data['name'] === 'string' ? data['name'] : 'Traveler',
            email: typeof data['email'] === 'string' ? data['email'] : user.email ?? '',
            date: typeof data['date'] === 'string' ? data['date'] : '',
            status: typeof data['status'] === 'string' ? data['status'] : 'pending',
            createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'] : null
          };
        })
        .sort((a, b) => {
          const left = a.createdAt?.toMillis() ?? 0;
          const right = b.createdAt?.toMillis() ?? 0;
          return right - left;
        });
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
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

  formatCreatedAt(value: Timestamp | null): string {
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

  private getErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return 'Firestore rules blocked this read. Deploy the latest rules and try again.';
    }

    return 'We could not load your bookings right now.';
  }
}
