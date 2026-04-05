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
  private readonly requireVerifiedEmail = false;

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

      const normalizedEmail = email.trim().toLowerCase();
      const credential = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
      this.syncUserDocument(credential.user);

      if (this.requireVerifiedEmail && !credential.user.emailVerified) {
        await this.sendVerificationEmailIfNeeded(credential.user, true);
        await signOut(this.auth);
        throw new Error('Please verify your email address before logging in.');
      }

      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after login.');
      }

      this.userSubject.next(mappedUser);

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

      const normalizedEmail = email.trim().toLowerCase();
      const credential = await createUserWithEmailAndPassword(this.auth, normalizedEmail, password);
      const sanitizedDisplayName = displayName.trim();

      if (sanitizedDisplayName) {
        await updateProfile(credential.user, { displayName: sanitizedDisplayName });
      }

      const mappedUser = this.mapFirebaseUser(this.auth.currentUser ?? credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after signup.');
      }

      this.userSubject.next(mappedUser);
      this.syncUserDocument(this.auth.currentUser ?? credential.user);

      if (!credential.user.emailVerified) {
        try {
          await this.sendVerificationEmailIfNeeded(this.auth.currentUser ?? credential.user, true);
        } catch (error: unknown) {
          // Account creation should not fail if verification email delivery is misconfigured.
          console.warn('Unable to send verification email after signup.', error);
        }

        if (this.requireVerifiedEmail) {
          await signOut(this.auth);
          this.userSubject.next(null);
        }
      }

      return mappedUser;
    }, 'Signup failed. Please try again.');
  }

  async googleLogin(): Promise<AppUser> {
    return this.runWithLoading(async () => {
      await this.persistenceReady;

      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      this.syncUserDocument(credential.user);

      const mappedUser = this.mapFirebaseUser(credential.user);
      if (!mappedUser) {
        throw new Error('Unable to fetch user details after Google sign-in.');
      }

      this.userSubject.next(mappedUser);
      return mappedUser;
    }, 'Google sign-in failed. Please try again.');
  }

  async logout(): Promise<void> {
    await this.runWithLoading(async () => {
      await signOut(this.auth);
      this.userSubject.next(null);
    }, 'Logout failed. Please try again.');
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.uid ?? null;
  }

  requiresEmailVerification(user: AppUser | null = this.currentUser): boolean {
    if (!this.requireVerifiedEmail) {
      return false;
    }

    if (!user) {
      return false;
    }

    if (user.providerIds.includes('password')) {
      return !user.emailVerified;
    }

    // Some auth responses can arrive before provider metadata is fully populated.
    return user.providerIds.length === 0 && user.email.length > 0 && !user.emailVerified;
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
    let existingCreatedAt: unknown = serverTimestamp();

    try {
      const existingSnapshot = await getDoc(userRef);
      if (existingSnapshot.exists()) {
        existingCreatedAt = existingSnapshot.data()['createdAt'] ?? existingCreatedAt;
      }
    } catch {
      // Reading may fail with strict legacy rules; attempt write anyway.
    }

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: safeEmail,
        displayName: user.displayName?.trim() ?? '',
        createdAt: existingCreatedAt
      },
      { merge: true }
    );
  }

  private syncUserDocument(user: User): void {
    void this.upsertUserDocument(user).catch((error: unknown) => {
      // Authentication should not be blocked by profile-sync issues.
      console.warn('Unable to sync user profile document to Firestore.', error);
    });
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

  private async sendVerificationEmailIfNeeded(user: User, force = false): Promise<void> {
    const isPasswordAccount = force || user.providerData.some((provider) => provider?.providerId === 'password');

    if (!isPasswordAccount || user.emailVerified) {
      return;
    }

    await sendEmailVerification(user);
  }

  private async runWithLoading<T>(operation: () => Promise<T>, fallbackMessage: string): Promise<T> {
    this.loadingSubject.next(true);

    try {
      return await this.withTimeout(
        operation(),
        15000,
        'Authentication request timed out. Check your network and Firebase configuration, then try again.'
      );
    } catch (error: unknown) {
      throw new Error(this.getAuthErrorMessage(error, fallbackMessage));
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
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
      case 'auth/admin-restricted-operation':
        return 'This sign-in method is currently restricted in Firebase Auth settings.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.';
      case 'auth/configuration-not-found':
        return 'Firebase authentication providers are not configured correctly for this app.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection and try again.';
      case 'auth/invalid-api-key':
        return 'Firebase auth is not configured correctly. Check your API key and project settings.';
      case 'auth/invalid-continue-uri':
      case 'auth/missing-continue-uri':
        return 'Email verification link configuration is invalid. Check Firebase Auth action URL settings.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for Firebase login. Add it in Firebase Auth settings.';
      default:
        return fallbackMessage;
    }
  }
}
