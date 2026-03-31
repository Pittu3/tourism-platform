import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  AuthError,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  providerIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  private readonly userSubject = new BehaviorSubject<AppUser | null>(
    this.mapFirebaseUser(this.auth.currentUser)
  );
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  private readonly persistenceReady: Promise<void>;
  private readonly authReady: Promise<void>;

  readonly user$: Observable<AppUser | null> = this.userSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(map((user) => user !== null));

  constructor() {
    // Keep users logged in across refreshes.
    this.persistenceReady = setPersistence(this.auth, browserLocalPersistence).catch(() => undefined);

    this.authReady = new Promise<void>((resolve) => {
      let initialized = false;

      onAuthStateChanged(this.auth, (firebaseUser) => {
        const mappedUser = this.mapFirebaseUser(firebaseUser);
        this.userSubject.next(mappedUser);

        if (!initialized) {
          initialized = true;
          resolve();
        }
      });
    });
  }

  get currentUser(): AppUser | null {
    return this.userSubject.value;
  }

  async whenReady(): Promise<void> {
    await Promise.all([this.persistenceReady, this.authReady]);
  }

  async login(email: string, password: string): Promise<AppUser> {
    return this.runWithLoading(async () => {
      await this.persistenceReady;

      const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
      await this.upsertUserDocument(credential.user);

      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after login.');
      }

      if (this.requiresEmailVerification(mappedUser)) {
        await this.sendVerificationEmailIfNeeded(credential.user);
        await signOut(this.auth);
        throw new Error('Please verify your email address before logging in.');
      }

      return mappedUser;
    }, 'Login failed. Please try again.');
  }

  async signup(displayName: string, email: string, password: string): Promise<AppUser> {
    return this.runWithLoading(async () => {
      await this.persistenceReady;

      const credential = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
      const sanitizedDisplayName = displayName.trim();

      if (sanitizedDisplayName) {
        await updateProfile(credential.user, { displayName: sanitizedDisplayName });
      }

      const mappedUser = this.mapFirebaseUser(this.auth.currentUser ?? credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after signup.');
      }

      await this.upsertUserDocument(this.auth.currentUser ?? credential.user);

      if (this.requiresEmailVerification(mappedUser)) {
        await this.sendVerificationEmailIfNeeded(this.auth.currentUser ?? credential.user);
        await signOut(this.auth);
      }

      return mappedUser;
    }, 'Signup failed. Please try again.');
  }

  async googleLogin(): Promise<AppUser> {
    return this.runWithLoading(async () => {
      await this.persistenceReady;

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

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.uid ?? null;
  }

  requiresEmailVerification(user: AppUser | null = this.currentUser): boolean {
    if (!user) {
      return false;
    }

    return user.providerIds.includes('password') && !user.emailVerified;
  }

  canAccessProtectedRoutes(user: AppUser | null = this.currentUser): boolean {
    return Boolean(user) && !this.requiresEmailVerification(user);
  }

  private async upsertUserDocument(user: User): Promise<void> {
    const safeEmail = user.email?.trim().toLowerCase();
    if (!safeEmail) {
      return;
    }

    const userRef = doc(this.firestore, 'users', user.uid);
    const existingSnapshot = await getDoc(userRef);
    const existingCreatedAt = existingSnapshot.exists()
      ? (existingSnapshot.data()['createdAt'] ?? serverTimestamp())
      : serverTimestamp();

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: safeEmail,
        displayName: user.displayName?.trim() ?? '',
        createdAt: existingCreatedAt
      }
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
      photoURL: user.photoURL ?? '',
      emailVerified: user.emailVerified,
      providerIds: user.providerData
        .map((provider) => provider?.providerId ?? '')
        .filter((providerId, index, providers) => providerId.length > 0 && providers.indexOf(providerId) === index)
    };
  }

  private async sendVerificationEmailIfNeeded(user: User): Promise<void> {
    const isPasswordAccount = user.providerData.some((provider) => provider?.providerId === 'password');

    if (!isPasswordAccount || user.emailVerified) {
      return;
    }

    await sendEmailVerification(user);
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
      case 'auth/missing-email':
        return 'Please enter your email address.';
      case 'auth/missing-password':
        return 'Please enter your password.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'Email/password login is not enabled for this project yet.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection and try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      default:
        return fallbackMessage;
    }
  }
}
