import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  query,
  serverTimestamp,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  imageUrl: string;
  price?: number;
  popularity?: number;
  rating?: number;
  duration?: string;
  bestSeason?: string;
  priceRange?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AddActivityPayload {
  title: string;
  description: string;
  location: string;
  category: string;
  imageUrl?: string;
  price?: number;
  popularity?: number;
  rating?: number;
  duration?: string;
  bestSeason?: string;
  priceRange?: string;
}

export interface Booking {
  id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  travelDate: string;
  travelers: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Timestamp;
}

export interface CreateBookingPayload {
  userId: string;
  activityId: string;
  activityTitle: string;
  travelDate: string;
  travelers: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);
  private readonly firebaseService = inject(FirebaseService);

  private readonly usersCollection = collection(this.firestore, 'users');
  private readonly activitiesCollection = collection(this.firestore, 'activities');
  private readonly bookingsCollection = collection(this.firestore, 'bookings');

  async addActivity(payload: AddActivityPayload, imageFile?: File): Promise<string> {
    let imageUrl = payload.imageUrl ?? '';

    if (imageFile) {
      imageUrl = await this.firebaseService.uploadActivityImage(imageFile);
    }

    const activityData: Record<string, unknown> = {
      title: payload.title,
      description: payload.description,
      location: payload.location,
      category: payload.category,
      imageUrl,
      popularity: payload.popularity ?? 0,
      rating: payload.rating ?? 4.2,
      duration: payload.duration ?? '',
      bestSeason: payload.bestSeason ?? '',
      priceRange: payload.priceRange ?? '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (typeof payload.price === 'number') {
      activityData['price'] = payload.price;
    }

    const activityDoc = await addDoc(this.activitiesCollection, activityData);

    return activityDoc.id;
  }

  getActivities(): Observable<Activity[]> {
    return collectionData(this.activitiesCollection, { idField: 'id' }) as Observable<Activity[]>;
  }

  async createBooking(payload: CreateBookingPayload): Promise<string> {
    const bookingDoc = await addDoc(this.bookingsCollection, {
      userId: payload.userId,
      activityId: payload.activityId,
      activityTitle: payload.activityTitle,
      travelDate: payload.travelDate,
      travelers: payload.travelers,
      status: payload.status ?? 'pending',
      createdAt: serverTimestamp()
    });

    return bookingDoc.id;
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    const bookingsQuery = query(this.bookingsCollection, where('userId', '==', userId));
    return collectionData(bookingsQuery, { idField: 'id' }) as Observable<Booking[]>;
  }
}
