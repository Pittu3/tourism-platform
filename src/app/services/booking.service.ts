import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { FALLBACK_DESTINATIONS } from '../data/destinations-data';

export interface DestinationOption {
  name: string;
  location: string;
  duration: string;
}

export interface TourOption {
  id: string;
  destinationName: string;
  title: string;
  duration: string;
  departureTime: string;
  pricePerPerson: number;
  availableSeats: number;
  highlights: string[];
}

export interface BookingRequest {
  destinationName: string;
  tourId: string;
  travelDate: string;
  travelers: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface BookingConfirmation {
  bookingId: string;
  status: 'confirmed';
  submittedAt: string;
  destinationName: string;
  tourTitle: string;
  travelDate: string;
  travelers: number;
  totalAmount: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly indianPhonePattern = /^[6-9][0-9]{9}$/;
  private readonly isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  private readonly destinationOptions: DestinationOption[] = [...FALLBACK_DESTINATIONS]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((destination) => ({
      name: destination.name,
      location: destination.location,
      duration: destination.duration
    }));

  getDestinationOptions(): DestinationOption[] {
    return this.destinationOptions;
  }

  getToursForDestination(destinationName: string): Observable<TourOption[]> {
    const destination = this.destinationOptions.find((option) => option.name === destinationName);
    if (!destination) {
      return of([]);
    }

    return of(this.buildTours(destination)).pipe(delay(250));
  }

  submitBooking(request: BookingRequest): Observable<BookingConfirmation> {
    const normalizedRequest = this.normalizeRequest(request);
    const validationError = this.validateBookingRequest(normalizedRequest);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const destination = this.destinationOptions.find(
      (option) => option.name === normalizedRequest.destinationName
    );
    if (!destination) {
      return throwError(() => new Error('Please select a valid destination.'));
    }

    const selectedTour = this.buildTours(destination).find((tour) => tour.id === normalizedRequest.tourId);
    if (!selectedTour) {
      return throwError(() => new Error('Selected tour is unavailable. Please choose another tour.'));
    }

    if (normalizedRequest.travelers > selectedTour.availableSeats) {
      return throwError(
        () => new Error(`Only ${selectedTour.availableSeats} seats are available for this tour.`)
      );
    }

    const totalAmount = selectedTour.pricePerPerson * normalizedRequest.travelers;
    const confirmation: BookingConfirmation = {
      bookingId: `BK-${Date.now().toString().slice(-8)}`,
      status: 'confirmed',
      submittedAt: new Date().toISOString(),
      destinationName: normalizedRequest.destinationName,
      tourTitle: selectedTour.title,
      travelDate: normalizedRequest.travelDate,
      travelers: normalizedRequest.travelers,
      totalAmount,
      message: `Booking confirmed for ${normalizedRequest.fullName}.`
    };

    return of(confirmation).pipe(delay(600));
  }

  private buildTours(destination: DestinationOption): TourOption[] {
    const stayDays = this.getStayDays(destination.duration);
    const destinationKey = this.slugify(destination.name);
    const basePrice = 2800 + stayDays * 1200 + (this.hash(destination.name) % 1400);

    return [
      {
        id: `${destinationKey}-sunrise`,
        destinationName: destination.name,
        title: 'Sunrise Explorer',
        duration: destination.duration,
        departureTime: '06:30 AM',
        pricePerPerson: basePrice,
        availableSeats: 6 + (this.hash(destination.name + 'sunrise') % 10),
        highlights: ['Guided sightseeing', 'AC transfers', 'Breakfast included']
      },
      {
        id: `${destinationKey}-heritage`,
        destinationName: destination.name,
        title: 'Heritage Plus',
        duration: `${stayDays + 1}D / ${stayDays}N`,
        departureTime: '08:00 AM',
        pricePerPerson: basePrice + 1800,
        availableSeats: 5 + (this.hash(destination.name + 'heritage') % 8),
        highlights: ['Expert guide', 'Entry tickets included', '2 meals per day']
      },
      {
        id: `${destinationKey}-comfort`,
        destinationName: destination.name,
        title: 'Premium Comfort',
        duration: `${stayDays + 1}D / ${stayDays}N`,
        departureTime: '09:00 AM',
        pricePerPerson: basePrice + 3200,
        availableSeats: 4 + (this.hash(destination.name + 'comfort') % 6),
        highlights: ['Premium stay', 'Private cab', 'Airport or station pickup']
      }
    ];
  }

  private getStayDays(duration: string): number {
    const match = duration.match(/(\d+)\s*D/i);
    return match ? Number(match[1]) : 2;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private normalizeRequest(request: BookingRequest): BookingRequest {
    return {
      destinationName: request.destinationName.trim(),
      tourId: request.tourId.trim(),
      travelDate: request.travelDate.trim(),
      travelers: Math.trunc(Number(request.travelers)),
      fullName: request.fullName.trim(),
      email: request.email.trim().toLowerCase(),
      phone: request.phone.replace(/\s+/g, '').trim(),
      specialRequests: request.specialRequests.trim()
    };
  }

  private validateBookingRequest(request: BookingRequest): string | null {
    if (!request.destinationName) {
      return 'Please select a destination before submitting.';
    }

    if (!request.tourId) {
      return 'Please select an available tour before submitting.';
    }

    if (!this.isoDatePattern.test(request.travelDate)) {
      return 'Please select a valid travel date.';
    }

    const selectedDate = new Date(`${request.travelDate}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return 'Please select a valid travel date.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'Travel date cannot be in the past.';
    }

    if (!Number.isInteger(request.travelers) || request.travelers < 1 || request.travelers > 12) {
      return 'Traveler count should be between 1 and 12.';
    }

    if (request.fullName.length < 3) {
      return 'Please enter your full name (at least 3 characters).';
    }

    if (!this.emailPattern.test(request.email)) {
      return 'Please enter a valid email address.';
    }

    if (!this.indianPhonePattern.test(request.phone)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (request.specialRequests.length > 250) {
      return 'Special requests can be up to 250 characters.';
    }

    return null;
  }
}
