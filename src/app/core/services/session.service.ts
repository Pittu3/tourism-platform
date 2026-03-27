import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionUser {
  uid: string;
  email: string;
}

const SESSION_STORAGE_KEY = 'tourism-platform.session-user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly userSubject = new BehaviorSubject<SessionUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get currentUser(): SessionUser | null {
    return this.userSubject.value;
  }

  setUser(user: SessionUser): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  clearUser(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.userSubject.next(null);
  }

  private readStoredUser(): SessionUser | null {
    const value = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed?.uid === 'string' && typeof parsed?.email === 'string') {
        return { uid: parsed.uid, email: parsed.email };
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    return null;
  }
}
