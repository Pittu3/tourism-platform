import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(auth.currentUser);
  private readonly authReady = auth.authStateReady();
  private readonly googleProvider = new GoogleAuthProvider();

  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly sessionService: SessionService) {
    onAuthStateChanged(auth, (user) => {
      this.userSubject.next(user);
      if (user?.email) {
        this.sessionService.setUser({ uid: user.uid, email: user.email });
      } else {
        this.sessionService.clearUser();
      }
    });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  whenReady(): Promise<void> {
    return this.authReady;
  }

  async login(email: string, password: string, rememberMe: boolean): Promise<UserCredential> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    await setPersistence(auth, persistence);
    return signInWithEmailAndPassword(auth, email, password);
  }

  async register(email: string, password: string, rememberMe: boolean): Promise<UserCredential> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    await setPersistence(auth, persistence);
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async loginWithGoogle(rememberMe: boolean): Promise<void> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    await setPersistence(auth, persistence);
    await signInWithRedirect(auth, this.googleProvider);
  }

  logout(): Promise<void> {
    return signOut(auth);
  }
}
