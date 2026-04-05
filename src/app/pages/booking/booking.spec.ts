import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Booking } from './booking';
import { BookingService, DestinationOption, TourOption } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

describe('Booking', () => {
  let component: Booking;
  let fixture: ComponentFixture<Booking>;
  let bookingServiceMock: {
    getDestinationOptions: ReturnType<typeof vi.fn>;
    getToursForDestination: ReturnType<typeof vi.fn>;
    submitBooking: ReturnType<typeof vi.fn>;
  };
  let firestoreServiceMock: {
    createBooking: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    user$: BehaviorSubject<{ email: string; displayName: string } | null>;
    currentUser: { uid: string; email: string; displayName: string } | null;
  };

  const destinationOptions: DestinationOption[] = [
    { name: 'Munnar', location: 'Kerala', duration: '4D / 3N' }
  ];
  const tours: TourOption[] = [
    {
      id: 'munnar-sunrise',
      destinationName: 'Munnar',
      title: 'Sunrise Explorer',
      duration: '4D / 3N',
      departureTime: '06:30 AM',
      pricePerPerson: 5000,
      availableSeats: 8,
      highlights: ['Guide', 'Breakfast']
    }
  ];

  beforeEach(async () => {
    bookingServiceMock = {
      getDestinationOptions: vi.fn().mockReturnValue(destinationOptions),
      getToursForDestination: vi.fn().mockReturnValue(of(tours)),
      submitBooking: vi.fn()
    };

    firestoreServiceMock = {
      createBooking: vi.fn().mockResolvedValue('booking-1')
    };

    authServiceMock = {
      user$: new BehaviorSubject<{ email: string; displayName: string } | null>({
        email: 'traveler@example.com',
        displayName: 'Demo User'
      }),
      currentUser: {
        uid: 'user-1',
        email: 'traveler@example.com',
        displayName: 'Demo User'
      }
    };

    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock as unknown as BookingService },
        { provide: AuthService, useValue: authServiceMock },
        { provide: FirestoreService, useValue: firestoreServiceMock as unknown as FirestoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads destination options and prefills known user details on init', () => {
    expect(component.destinationOptions).toEqual(destinationOptions);
    expect(component.formControls.email.value).toBe('traveler@example.com');
    expect(component.formControls.fullName.value).toBe('Demo User');
  });

  it('loads tours for the selected destination', () => {
    component.formControls.destinationName.setValue('Munnar');

    component.onDestinationChange();

    expect(bookingServiceMock.getToursForDestination).toHaveBeenCalledWith('Munnar');
    expect(component.availableTours).toEqual(tours);
    expect(component.loadingTours).toBe(false);
  });

  it('shows an error when booking submission fails', () => {
    bookingServiceMock.submitBooking.mockReturnValue(
      throwError(() => new Error('Selected tour is unavailable. Please choose another tour.'))
    );

    component.formControls.destinationName.setValue('Munnar');
    component.formControls.tourId.setValue('munnar-sunrise');
    component.formControls.travelDate.setValue('2099-06-15');
    component.formControls.travelers.setValue(2);
    component.formControls.fullName.setValue('Demo User');
    component.formControls.email.setValue('traveler@example.com');
    component.formControls.phone.setValue('9876543210');
    component.formControls.specialRequests.setValue('');
    component.formControls.agreeToPolicy.setValue(true);

    component.submitBooking();

    expect(component.bookingError).toBe('Selected tour is unavailable. Please choose another tour.');
    expect(firestoreServiceMock.createBooking).not.toHaveBeenCalled();
    expect(component.submitting).toBe(false);
  });

  it('shows an error when Firestore sync fails after confirmation', async () => {
    const confirmation = {
      bookingId: 'BK-12345678',
      status: 'confirmed' as const,
      submittedAt: new Date().toISOString(),
      destinationName: 'Munnar',
      tourTitle: 'Sunrise Explorer',
      travelDate: '2099-06-15',
      travelers: 2,
      totalAmount: 10000,
      message: 'Booking confirmed for Demo User.'
    };

    bookingServiceMock.submitBooking.mockReturnValue(of(confirmation));
    firestoreServiceMock.createBooking.mockRejectedValue(new Error('Missing or insufficient permissions.'));

    component.formControls.destinationName.setValue('Munnar');
    component.formControls.tourId.setValue('munnar-sunrise');
    component.formControls.travelDate.setValue('2099-06-15');
    component.formControls.travelers.setValue(2);
    component.formControls.fullName.setValue('Demo User');
    component.formControls.email.setValue('traveler@example.com');
    component.formControls.phone.setValue('9876543210');
    component.formControls.specialRequests.setValue('');
    component.formControls.agreeToPolicy.setValue(true);

    component.submitBooking();
    await fixture.whenStable();

    expect(component.bookingSuccess).toBeNull();
    expect(component.bookingError).toBe('Missing or insufficient permissions.');
    expect(component.submitting).toBe(false);
  });

  it('saves booking to account with legacy-compatible payload', async () => {
    const confirmation = {
      bookingId: 'BK-77770000',
      status: 'confirmed' as const,
      submittedAt: new Date().toISOString(),
      destinationName: 'Munnar',
      tourTitle: 'Sunrise Explorer',
      travelDate: '2099-06-15',
      travelers: 2,
      totalAmount: 10000,
      message: 'Booking confirmed for Demo User.'
    };

    bookingServiceMock.submitBooking.mockReturnValue(of(confirmation));
    firestoreServiceMock.createBooking.mockResolvedValue('booking-1');

    component.formControls.destinationName.setValue('Munnar');
    component.formControls.tourId.setValue('munnar-sunrise');
    component.formControls.travelDate.setValue('2099-06-15');
    component.formControls.travelers.setValue(2);
    component.formControls.fullName.setValue('Demo User');
    component.formControls.email.setValue('traveler@example.com');
    component.formControls.phone.setValue('9876543210');
    component.formControls.specialRequests.setValue('');
    component.formControls.agreeToPolicy.setValue(true);

    component.submitBooking();
    await fixture.whenStable();

    expect(firestoreServiceMock.createBooking).toHaveBeenCalledWith({
      userId: 'user-1',
      activityId: 'munnar-sunrise',
      activityTitle: 'Sunrise Explorer',
      travelDate: '2099-06-15',
      travelers: 2,
      status: 'confirmed',
      userEmail: 'traveler@example.com',
      name: 'Demo User',
      email: 'traveler@example.com',
      date: '2099-06-15'
    });
    expect(component.bookingError).toBe('');
    expect(component.bookingSuccess).toEqual(confirmation);
  });
});
