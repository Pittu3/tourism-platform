import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit, OnDestroy {
  private authSubscription?: Subscription;
  protected isSignedIn = false;

  constructor(
    private readonly bookingService: BookingService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService
  ) {}

  name = '';
  email = '';
  date = '';
  submitted = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  debugMessage = '';

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.subscribe((user) => {
      this.isSignedIn = !!user;
      if (!this.email && user?.email) {
        this.email = user.email;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  async submit(form: NgForm): Promise<void> {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.debugMessage = 'Validating form...';
    this.cdr.detectChanges();

    if (form.invalid) {
      this.debugMessage = 'Form validation failed.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.debugMessage = 'Sending booking request to Firestore...';
    this.cdr.detectChanges();

    try {
      await this.bookingService.createBooking({
        name: this.name.trim(),
        email: this.email.trim(),
        date: this.date
      });

      this.successMessage = 'Booking saved successfully. We will contact you soon.';
      this.debugMessage = 'Firestore accepted the booking.';
      form.resetForm({ email: this.authService.currentUser?.email ?? '' });
      this.submitted = false;
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
      this.debugMessage = `Booking failed: ${this.errorMessage}`;
      console.error('Booking submission failed:', error);
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message === 'booking-timeout') {
      return 'Booking request timed out. Check your Firestore rules or browser shields and try again.';
    }

    if (error instanceof Error && error.message === 'auth-required') {
      return 'Please sign in before creating a booking.';
    }

    if (!(error instanceof FirebaseError)) {
      return 'Booking failed. Please try again.';
    }

    if (error.code === 'permission-denied') {
      return 'Firestore blocked this request. Update your Firestore rules to allow booking writes.';
    }

    if (error.code === 'unavailable') {
      return 'Firestore is temporarily unavailable. Please try again.';
    }

    return 'Booking could not be saved. Check your Firestore setup and try again.';
  }
}
