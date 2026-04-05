import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  BookingConfirmation,
  BookingRequest,
  BookingService,
  DestinationOption,
  TourOption
} from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { CreateBookingPayload, FirestoreService } from '../../services/firestore.service';

function notPastDateValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const selectedDate = new Date(`${control.value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly subscriptions = new Subscription();
  private toursRequestId = 0;

  destinationOptions: DestinationOption[] = [];
  availableTours: TourOption[] = [];
  selectedTour: TourOption | null = null;

  minTravelDate = '';
  loadingTours = false;
  submitting = false;
  submitted = false;

  bookingError = '';
  bookingSuccess: BookingConfirmation | null = null;

  readonly bookingForm = this.formBuilder.nonNullable.group({
    destinationName: ['', Validators.required],
    tourId: ['', Validators.required],
    travelDate: ['', [Validators.required, notPastDateValidator]],
    travelers: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
    specialRequests: ['', [Validators.maxLength(250)]],
    agreeToPolicy: [false, Validators.requiredTrue]
  });

  ngOnInit(): void {
    this.destinationOptions = this.bookingService.getDestinationOptions();
    this.minTravelDate = this.getTodayIsoDate();

    const authSubscription = this.authService.user$.subscribe((user) => {
      if (!user) {
        return;
      }

      if (!this.formControls.email.value && user.email) {
        this.formControls.email.setValue(user.email);
      }

      if (!this.formControls.fullName.value && user.displayName) {
        this.formControls.fullName.setValue(user.displayName);
      }
    });

    this.subscriptions.add(authSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get formControls() {
    return this.bookingForm.controls;
  }

  onDestinationChange(): void {
    const destinationName = this.formControls.destinationName.value;
    const currentRequestId = ++this.toursRequestId;
    this.formControls.tourId.setValue('');
    this.selectedTour = null;
    this.availableTours = [];
    this.bookingError = '';
    this.bookingSuccess = null;

    if (!destinationName) {
      return;
    }

    this.loadingTours = true;

    this.bookingService.getToursForDestination(destinationName).subscribe({
      next: (tours) => {
        if (currentRequestId !== this.toursRequestId) {
          return;
        }

        this.availableTours = tours;
        this.loadingTours = false;
      },
      error: () => {
        if (currentRequestId !== this.toursRequestId) {
          return;
        }

        this.bookingError = 'Unable to load tours right now. Please try again.';
        this.loadingTours = false;
      }
    });
  }

  selectTour(tourId: string): void {
    this.formControls.tourId.setValue(tourId);
    this.formControls.tourId.markAsTouched();
    this.selectedTour = this.availableTours.find((tour) => tour.id === tourId) ?? null;
    this.bookingError = '';
    this.bookingSuccess = null;
  }

  submitBooking(): void {
    if (this.submitting) {
      return;
    }

    this.submitted = true;
    this.bookingError = '';
    this.bookingSuccess = null;

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const value = this.bookingForm.getRawValue();
    const payload: BookingRequest = {
      destinationName: value.destinationName,
      tourId: value.tourId,
      travelDate: value.travelDate,
      travelers: Number(value.travelers),
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      specialRequests: value.specialRequests.trim()
    };

    this.submitting = true;

    this.bookingService.submitBooking(payload).subscribe({
      next: async (confirmation) => {
        const authenticatedUser = this.authService.currentUser;

        if (!authenticatedUser) {
          this.bookingError = 'Your session expired. Please log in again.';
          this.submitting = false;
          return;
        }

        try {
          const accountEmail = authenticatedUser.email || value.email.trim();
          const bookingPayload: CreateBookingPayload = {
            userId: authenticatedUser.uid,
            activityId: value.tourId,
            activityTitle: confirmation.tourTitle,
            travelDate: value.travelDate,
            travelers: Number(value.travelers),
            status: 'confirmed',
            userEmail: accountEmail,
            name: value.fullName.trim(),
            email: accountEmail,
            date: value.travelDate
          };

          await this.firestoreService.createBooking(bookingPayload);
        } catch (error: unknown) {
          this.bookingError =
            error instanceof Error && error.message
              ? error.message
              : 'Unable to save booking details to Firestore. Please try again.';
          this.submitting = false;
          return;
        }

        const selectedDestination = this.formControls.destinationName.value;

        this.bookingSuccess = confirmation;
        this.submitting = false;
        this.submitted = false;

        this.bookingForm.reset({
          destinationName: selectedDestination,
          tourId: '',
          travelDate: '',
          travelers: 2,
          fullName: value.fullName,
          email: value.email,
          phone: '',
          specialRequests: '',
          agreeToPolicy: false
        });

        this.selectedTour = null;
      },
      error: (error: unknown) => {
        this.bookingError =
          error instanceof Error ? error.message : 'Booking request failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  hasError(controlName: keyof typeof this.bookingForm.controls, errorCode: string): boolean {
    const control = this.bookingForm.controls[controlName];
    return control.hasError(errorCode) && (control.touched || this.submitted);
  }

  trackTour(index: number, tour: TourOption): string {
    return tour.id;
  }

  private getTodayIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
