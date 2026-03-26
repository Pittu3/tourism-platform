import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormBuilder
} from '@angular/forms';
import { ContactRequest, ContactResponse, ContactService } from '../../services/contact.service';

function noHtmlTagValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value ?? '';
  return /<[^>]+>/.test(value) ? { htmlNotAllowed: true } : null;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  private readonly formBuilder = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  readonly inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking-help', label: 'Booking Assistance' },
    { value: 'support', label: 'Trip Support' },
    { value: 'partnership', label: 'Partnership' }
  ] as const;

  readonly contactForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), noHtmlTagValidator]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
    inquiryType: ['general', Validators.required],
    subject: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(80)]],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(600), noHtmlTagValidator]],
    consent: [false, Validators.requiredTrue]
  });

  submitting = false;
  submitted = false;
  errorMessage = '';
  response: ContactResponse | null = null;

  get controls() {
    return this.contactForm.controls;
  }

  hasError(controlName: keyof typeof this.contactForm.controls, errorCode: string): boolean {
    const control = this.controls[controlName];
    return control.hasError(errorCode) && (control.touched || this.submitted);
  }

  submitInquiry(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.response = null;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();
    const payload: ContactRequest = {
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      inquiryType: value.inquiryType,
      subject: value.subject.trim(),
      message: value.message.trim()
    };

    this.submitting = true;

    this.contactService.submitInquiry(payload).subscribe({
      next: (result) => {
        this.response = result;
        this.submitting = false;
        this.submitted = false;

        this.contactForm.reset({
          fullName: '',
          email: '',
          phone: '',
          inquiryType: 'general',
          subject: '',
          message: '',
          consent: false
        });
      },
      error: (error: unknown) => {
        this.errorMessage =
          error instanceof Error ? error.message : 'Unable to submit your message right now.';
        this.submitting = false;
      }
    });
  }
}
