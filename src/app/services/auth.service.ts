import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, addDoc, collection, doc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import {
  AuthError,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface BookingData {
  activityId: string;
  activityTitle: string;
  travelDate: string;
  travelers: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly user$: Observable<AppUser | null> = authState(this.auth).pipe(
    map((user) => this.mapFirebaseUser(user)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(map((user) => user !== null));

  get currentUser(): AppUser | null {
    return this.mapFirebaseUser(this.auth.currentUser);
  }

  async login(email: string, password: string): Promise<AppUser> {
    return this.runWithLoading(async () => {
      const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
      await this.upsertUserDocument(credential.user);
      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after login.');
      }
      return mappedUser;
    }, 'Login failed. Please try again.');
  }

  async signup(email: string, password: string): Promise<AppUser> {
    return this.runWithLoading(async () => {
      const credential = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
      await this.upsertUserDocument(credential.user);
      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after signup.');
      }
      return mappedUser;
    }, 'Signup failed. Please try again.');
  }

  async googleLogin(): Promise<AppUser> {
    return this.runWithLoading(async () => {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      await this.upsertUserDocument(credential.user);
      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after Google sign-in.');
      }
      return mappedUser;
    }, 'Google sign-in failed. Please try again.');
  }

  async logout(): Promise<void> {
    await this.runWithLoading(async () => {
      await signOut(this.auth);
    }, 'Logout failed. Please try again.');
  }

  async setRememberSession(remember: boolean): Promise<void> {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistence);
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  async saveBooking(bookingData: BookingData): Promise<string> {
    return this.runWithLoading(async () => {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('Please login to save your booking.');
      }

      const bookingRef = await addDoc(collection(this.firestore, 'bookings'), {
        ...bookingData,
        userId,
        status: bookingData.status ?? 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return bookingRef.id;
    }, 'Unable to save booking right now. Please try again.');
  }

  private async upsertUserDocument(user: User): Promise<void> {
    const mappedUser = this.mapFirebaseUser(user);
    if (!mappedUser) {
      return;
    }

    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(
      userRef,
      {
        ...mappedUser,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  private mapFirebaseUser(user: User | null): AppUser | null {
    if (!user) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? ''
    };
  }

  private async runWithLoading<T>(operation: () => Promise<T>, fallbackMessage: string): Promise<T> {
    this.loadingSubject.next(true);
    try {
      return await operation();
    } catch (error: unknown) {
      throw new Error(this.getAuthErrorMessage(error, fallbackMessage));
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private getAuthErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!(error as AuthError)?.code) {
      if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
      }
      return fallbackMessage;
    }

    const code = (error as AuthError).code;
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account is disabled. Contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      default:
        return fallbackMessage;
    }
  }
}
