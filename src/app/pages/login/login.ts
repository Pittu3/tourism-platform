import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthError } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  private authSubscription?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  email = '';
  password = '';
  rememberMe = true;
  isRegisterMode = false;
  submitted = false;
  isSubmitting = false;
  isGoogleSubmitting = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.subscribe(async (user) => {
      if (!user) {
        return;
      }

      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/booking';
      this.isGoogleSubmitting = false;
      await this.router.navigateByUrl(redirectTo);
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const credential = this.isRegisterMode
        ? await this.authService.register(this.email, this.password, this.rememberMe)
        : await this.authService.login(this.email, this.password, this.rememberMe);

      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/booking';

      this.successMessage = this.isRegisterMode
        ? `Account created for ${credential.user.email ?? this.email}.`
        : `Logged in as ${credential.user.email ?? this.email}.`;
      form.resetForm({ rememberMe: this.rememberMe });
      this.submitted = false;
      await this.router.navigateByUrl(redirectTo);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.isGoogleSubmitting = true;

    try {
      this.successMessage = 'Redirecting to Google...';
      await this.authService.loginWithGoogle(this.rememberMe);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
      this.successMessage = '';
    } finally {
      if (this.errorMessage) {
        this.isGoogleSubmitting = false;
      }
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = false;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as AuthError).code;

      switch (code) {
        case 'auth/invalid-credential':
          return 'Invalid email or password.';
        case 'auth/invalid-email':
          return 'Enter a valid email address.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists.';
        case 'auth/weak-password':
          return 'Choose a stronger password with at least 6 characters.';
        case 'auth/operation-not-allowed':
          return this.isRegisterMode
            ? 'Enable Email/Password sign-in in Firebase Authentication.'
            : 'Enable the selected sign-in provider in Firebase Authentication.';
        case 'auth/unauthorized-domain':
          return 'Add this app domain to Firebase Authentication authorized domains.';
        case 'auth/account-exists-with-different-credential':
          return 'An account already exists with this email using a different sign-in method.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please wait and try again.';
        case 'auth/network-request-failed':
          return 'Network error. Check your connection and try again.';
      }
    }

    if (!(error instanceof FirebaseError)) {
      return 'Login failed. Please try again.';
    }

    switch (error.code) {
      default:
        return this.isRegisterMode
          ? 'Firebase sign-up is not configured yet. Enable Email/Password in Firebase Auth and try again.'
          : 'Firebase login is not configured yet. Add your project settings and create a user in Firebase Auth.';
    }
  }
}
