import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  email = '';
  password = '';
  submitted = false;
  successMessage = '';
  errorMessage = '';
  loading = false;
  googleLoading = false;
  showPassword = false;
  isAuthenticated = false;

  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  async onSubmit(form: NgForm): Promise<void> {
    if (this.loading) {
      return;
    }

    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Please correct the highlighted fields and try again.';
      return;
    }

    this.loading = true;

    try {
      const session = await this.authService.login(this.email, this.password);
      this.password = '';
      this.successMessage = `Welcome back, ${session.displayName || session.email}. Redirecting...`;
      this.redirectTimeoutId = setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 700);
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to login right now. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (this.googleLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.googleLoading = true;

    try {
      const credential = await this.authService.googleLogin();
      this.successMessage = `Signed in as ${credential.displayName || credential.email}. Redirecting...`;
      this.redirectTimeoutId = setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 700);
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to sign in with Google right now. Please try again.';
    } finally {
      this.googleLoading = false;
    }
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.successMessage = 'You are already logged in. Redirecting to dashboard...';
        this.redirectTimeoutId = setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 700);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
