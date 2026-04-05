import { Injectable, Injector, inject } from '@angular/core';
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
import { Observable, combineLatest, map } from 'rxjs';
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
  date?: string;
  people?: number;
  destination?: string;
  title?: string;
}

export interface CreateBookingPayload {
  userId: string;
  activityId: string;
  activityTitle: string;
  travelDate: string;
  travelers: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  userEmail?: string;
  name?: string;
  email?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  private readonly usersCollection = collection(this.firestore, 'users');
  private readonly activitiesCollection = collection(this.firestore, 'activities');
  private readonly bookingsCollection = collection(this.firestore, 'bookings');

  async addActivity(payload: AddActivityPayload, imageFile?: File): Promise<string> {
    let imageUrl = payload.imageUrl ?? '';

    if (imageFile) {
      const firebaseService = this.injector.get(FirebaseService);
      imageUrl = await firebaseService.uploadActivityImage(imageFile);
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
    const writeCandidates = this.buildBookingWriteCandidates(payload);
    let lastError: unknown = null;

    for (const bookingData of writeCandidates) {
      try {
        const bookingDoc = await addDoc(this.bookingsCollection, bookingData);
        return bookingDoc.id;
      } catch (error: unknown) {
        lastError = error;

        // Retry with next schema candidate only for permission/rules mismatches.
        if (!this.isPermissionDeniedError(error)) {
          throw error;
        }
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }
    throw new Error('Unable to save booking right now.');
  }

  getUserBookings(userId: string, userEmail?: string): Observable<Booking[]> {
    const byUserIdQuery = query(this.bookingsCollection, where('userId', '==', userId));
    const byUserId$ = collectionData(byUserIdQuery, {
      idField: 'id'
    }) as Observable<Record<string, unknown>[]>;

    const normalizedEmail = userEmail?.trim().toLowerCase() ?? '';
    if (!normalizedEmail) {
      return byUserId$.pipe(
        map((bookings) => bookings.map((booking) => this.normalizeBooking(booking)))
      );
    }

    const byEmailQuery = query(this.bookingsCollection, where('userEmail', '==', normalizedEmail));
    const byEmail$ = collectionData(byEmailQuery, {
      idField: 'id'
    }) as Observable<Record<string, unknown>[]>;

    return combineLatest([byUserId$, byEmail$]).pipe(
      map(([bookingsByUserId, bookingsByEmail]) =>
        [...bookingsByUserId, ...bookingsByEmail].map((booking) => this.normalizeBooking(booking))
      ),
      map((bookings) => this.dedupeBookings(bookings))
    );
  }

  private buildBookingWriteCandidates(payload: CreateBookingPayload): Record<string, unknown>[] {
    const modernStatus = payload.status ?? 'confirmed';
    const modernCandidate: Record<string, unknown> = {
      userId: payload.userId,
      activityId: payload.activityId,
      activityTitle: payload.activityTitle,
      travelDate: payload.travelDate,
      travelers: payload.travelers,
      status: modernStatus,
      createdAt: serverTimestamp()
    };

    const candidates: Record<string, unknown>[] = [modernCandidate];

    const legacyEmail = payload.userEmail ?? payload.email ?? '';
    const legacyName = payload.name ?? '';
    const legacyDate = payload.date ?? payload.travelDate;

    if (legacyEmail.trim().length > 0 && legacyName.trim().length > 0 && legacyDate.trim().length > 0) {
      // Legacy rules often require pending status + userEmail/name/email/date fields.
      candidates.push({
        ...modernCandidate,
        status: 'pending',
        userEmail: legacyEmail,
        name: legacyName,
        email: legacyEmail,
        date: legacyDate
      });

      // Safety candidate for strict legacy hasOnly schemas.
      candidates.push({
        userId: payload.userId,
        userEmail: legacyEmail,
        name: legacyName,
        email: legacyEmail,
        date: legacyDate,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    }

    return candidates;
  }

  private isPermissionDeniedError(error: unknown): boolean {
    const code = (error as { code?: string })?.code ?? '';
    const message = ((error as { message?: string })?.message ?? '').toLowerCase();

    return code.includes('permission-denied') || message.includes('missing or insufficient permissions');
  }

  private normalizeBooking(booking: Record<string, unknown>): Booking {
    const travelDate = this.normalizeTravelDate(booking['travelDate'] ?? booking['date']);
    const travelers = this.normalizeTravelers(booking['travelers'] ?? booking['people']);
    const activityTitle = this.normalizeActivityTitle(
      booking['activityTitle'] ?? booking['destination'] ?? booking['title']
    );
    const status = this.normalizeStatus(booking['status']);

    const rawId = booking['id'];
    const id = typeof rawId === 'string' && rawId.trim().length > 0
      ? rawId
      : this.createFallbackBookingId(activityTitle, travelDate, travelers);

    const rawUserId = booking['userId'];
    const userId = typeof rawUserId === 'string' ? rawUserId : '';

    const rawActivityId = booking['activityId'] ?? booking['destinationId'] ?? '';
    const activityId =
      typeof rawActivityId === 'string' || typeof rawActivityId === 'number'
        ? String(rawActivityId)
        : '';

    const rawCreatedAt = booking['createdAt'];
    const createdAt = rawCreatedAt instanceof Timestamp ? rawCreatedAt : undefined;

    return {
      id,
      userId,
      activityId,
      activityTitle,
      travelDate,
      travelers,
      status,
      createdAt,
      date: typeof booking['date'] === 'string' ? booking['date'] : undefined,
      people: typeof booking['people'] === 'number' ? booking['people'] : undefined,
      destination: typeof booking['destination'] === 'string' ? booking['destination'] : undefined,
      title: typeof booking['title'] === 'string' ? booking['title'] : undefined
    };
  }

  private normalizeTravelDate(value: unknown): string {
    const formatIsoDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return formatIsoDate(parsed);
      }
    }

    if (value instanceof Timestamp) {
      return formatIsoDate(value.toDate());
    }

    return formatIsoDate(new Date());
  }

  private normalizeTravelers(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return 1;
    }

    const rounded = Math.round(parsed);
    return Math.max(1, Math.min(12, rounded));
  }

  private normalizeActivityTitle(value: unknown): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    return 'Tour Booking';
  }

  private normalizeStatus(value: unknown): Booking['status'] {
    if (value === 'pending' || value === 'confirmed' || value === 'cancelled') {
      return value;
    }

    return 'confirmed';
  }

  private createFallbackBookingId(activityTitle: string, travelDate: string, travelers: number): string {
    return `legacy-${this.hash(`${activityTitle}|${travelDate}|${travelers}`)}`;
  }

  private dedupeBookings(bookings: Booking[]): Booking[] {
    const mapById = new Map<string, Booking>();

    for (const booking of bookings) {
      const existing = mapById.get(booking.id);
      if (!existing) {
        mapById.set(booking.id, booking);
        continue;
      }

      const existingTimestamp = existing.createdAt?.toMillis() ?? 0;
      const incomingTimestamp = booking.createdAt?.toMillis() ?? 0;
      if (incomingTimestamp >= existingTimestamp) {
        mapById.set(booking.id, booking);
      }
    }

    return Array.from(mapById.values());
  }

  private hash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16);
  }
}
