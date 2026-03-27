import { Injectable } from '@angular/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { firestore } from '../firebase/firebase';

export interface BookingPayload {
  name: string;
  email: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private readonly authService: AuthService) {}

  async createBooking(payload: BookingPayload): Promise<void> {
    await this.authService.whenReady();

    const user = this.authService.currentUser;

    if (!user) {
      throw new Error('auth-required');
    }

    await Promise.race([
      addDoc(collection(firestore, 'bookings'), {
        ...payload,
        userId: user.uid,
        userEmail: user.email ?? payload.email,
        status: 'pending',
        createdAt: serverTimestamp()
      }),
      this.timeoutAfter(15000)
    ]);
  }

  private timeoutAfter(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('booking-timeout')), ms);
    });
  }
}
