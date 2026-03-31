import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  authMode: AuthMode = 'login';

  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';

  loginSubmitted = false;
  registerSubmitted = false;

  successMessage = '';
  errorMessage = '';
  loading = false;
  googleLoading = false;
  showPassword = false;
  isAuthenticated = false;

  private redirectTo = '/home';
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/home';

    const routePath = this.route.snapshot.routeConfig?.path;
    this.authMode = routePath === 'register' ? 'register' : 'login';

    const queryMode = this.route.snapshot.queryParamMap.get('mode');
    if (queryMode === 'login' || queryMode === 'register') {
      this.authMode = queryMode;
    }

    const loggedOut = this.route.snapshot.queryParamMap.get('loggedOut');
    if (loggedOut === '1') {
      this.showSuccess('Logged out successfully.');
    }

    void this.redirectIfAuthenticated();
  }

  ngOnDestroy(): void {
    this.clearToastTimeout();
  }

  setMode(mode: AuthMode): void {
    if (this.authMode === mode) {
      return;
    }

    this.authMode = mode;
    this.loginSubmitted = false;
    this.registerSubmitted = false;
    this.resetFeedback();
  }

  async onLoginSubmit(form: NgForm): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loginSubmitted = true;
    this.registerSubmitted = false;
    this.resetFeedback();

    if (form.invalid) {
      this.showError('Please correct the highlighted fields and try again.');
      return;
    }

    this.loading = true;

    try {
      const session = await this.authService.login(this.loginEmail, this.loginPassword);
      this.loginPassword = '';
      this.isAuthenticated = true;
      await this.showSuccessThenRedirect(`Welcome back, ${session.displayName || session.email}.`);
    } catch (error: unknown) {
      this.showError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to login right now. Please try again.'
      );
    } finally {
      this.loading = false;
    }
  }

  async onRegisterSubmit(form: NgForm): Promise<void> {
    if (this.loading) {
      return;
    }

    this.registerSubmitted = true;
    this.loginSubmitted = false;
    this.resetFeedback();

    if (form.invalid) {
      this.showError('Please fill all required fields correctly.');
      return;
    }

    if (!this.passwordsMatch()) {
      this.showError('Passwords do not match.');
      return;
    }

    this.loading = true;

    try {
      const createdUser = await this.authService.signup(
        this.registerName,
        this.registerEmail,
        this.registerPassword
      );
      this.registerPassword = '';
      this.confirmPassword = '';
      this.isAuthenticated = true;
      await this.showSuccessThenRedirect(
        `Account created successfully. Welcome, ${createdUser.displayName || createdUser.email}.`
      );
    } catch (error: unknown) {
      this.showError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to create account right now. Please try again.'
      );
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (this.googleLoading || this.loading) {
      return;
    }

    this.resetFeedback();
    this.googleLoading = true;

    try {
      const credential = await this.authService.googleLogin();
      this.isAuthenticated = true;
      await this.showSuccessThenRedirect(
        `Signed in as ${credential.displayName || credential.email}.`
      );
    } catch (error: unknown) {
      this.showError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to sign in with Google right now. Please try again.'
      );
    } finally {
      this.googleLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwordsMatch(): boolean {
    return this.registerPassword === this.confirmPassword;
  }

  private async redirectIfAuthenticated(): Promise<void> {
    await this.authService.whenReady();

    if (!this.authService.currentUser) {
      this.isAuthenticated = false;
      return;
    }

    this.isAuthenticated = true;
    await this.navigateAfterAuth();
  }

  private async showSuccessThenRedirect(message: string): Promise<void> {
    this.showSuccess(message);
    await this.delay(750);
    await this.navigateAfterAuth();
  }

  private showSuccess(message: string): void {
    this.errorMessage = '';
    this.successMessage = message;
    this.scheduleToastClear();
  }

  private showError(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
    this.scheduleToastClear();
  }

  private scheduleToastClear(): void {
    this.clearToastTimeout();
    this.toastTimeoutId = setTimeout(() => {
      this.toastTimeoutId = null;
      this.resetFeedback();
    }, 3200);
  }

  private clearToastTimeout(): void {
    if (this.toastTimeoutId !== null) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  private async navigateAfterAuth(): Promise<void> {
    await this.router.navigateByUrl(this.redirectTo);
  }

  private resetFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
