import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Contact } from './contact';
import { ContactService } from '../../services/contact.service';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let contactServiceMock: {
    submitInquiry: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    contactServiceMock = {
      submitInquiry: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [{ provide: ContactService, useValue: contactServiceMock as unknown as ContactService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks the form touched and skips submission when invalid', () => {
    component.submitInquiry();

    expect(contactServiceMock.submitInquiry).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
  });

  it('stores a success response and resets the form after submission', () => {
    contactServiceMock.submitInquiry.mockReturnValue(
      of({
        ticketId: 'CT-12345678',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        estimatedReplyHours: 8,
        message: 'Thanks Demo User, our travel team has received your message.'
      })
    );

    component.contactForm.setValue({
      fullName: 'Demo User',
      email: 'demo@example.com',
      phone: '9876543210',
      inquiryType: 'booking-help',
      subject: 'Need help with a Kerala package',
      message: 'I need help selecting a five day Kerala itinerary for my family trip.',
      consent: true
    });

    component.submitInquiry();

    expect(contactServiceMock.submitInquiry).toHaveBeenCalled();
    expect(component.response?.ticketId).toBe('CT-12345678');
    expect(component.contactForm.getRawValue()).toEqual({
      fullName: '',
      email: '',
      phone: '',
      inquiryType: 'general',
      subject: '',
      message: '',
      consent: false
    });
  });

  it('shows the returned error when submission fails', () => {
    contactServiceMock.submitInquiry.mockReturnValue(
      throwError(() => new Error('Message contains blocked content. Please revise and retry.'))
    );

    component.contactForm.setValue({
      fullName: 'Demo User',
      email: 'demo@example.com',
      phone: '9876543210',
      inquiryType: 'general',
      subject: 'Trip question',
      message: 'This is a long enough message to pass validation before the service rejects it.',
      consent: true
    });

    component.submitInquiry();

    expect(component.errorMessage).toBe('Message contains blocked content. Please revise and retry.');
    expect(component.submitting).toBe(false);
  });
});
