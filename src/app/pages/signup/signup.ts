import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  email = '';
  password = '';
  confirmPassword = '';
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async onSubmit(form: NgForm): Promise<void> {
    if (this.loading) {
      return;
    }

    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    try {
      await this.authService.signup(this.email, this.password);
      this.successMessage = 'Account created successfully. Redirecting to dashboard...';
      this.password = '';
      this.confirmPassword = '';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 700);
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to create account right now. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
