import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

export interface ContactRequest {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  ticketId: string;
  status: 'submitted';
  submittedAt: string;
  estimatedReplyHours: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  submitInquiry(request: ContactRequest): Observable<ContactResponse> {
    const spamKeywords = ['http://', 'https://', 'free money', 'lottery'];
    const normalizedMessage = request.message.toLowerCase();
    const hasSpamKeyword = spamKeywords.some((keyword) => normalizedMessage.includes(keyword));

    if (hasSpamKeyword) {
      return throwError(() => new Error('Message contains blocked content. Please revise and retry.'));
    }

    const response: ContactResponse = {
      ticketId: `CT-${Date.now().toString().slice(-8)}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      estimatedReplyHours: this.getEstimatedReplyHours(request.inquiryType),
      message: `Thanks ${request.fullName}, our travel team has received your message.`
    };

    return of(response).pipe(delay(650));
  }

  private getEstimatedReplyHours(inquiryType: string): number {
    switch (inquiryType) {
      case 'support':
        return 4;
      case 'booking-help':
        return 8;
      case 'partnership':
        return 24;
      default:
        return 12;
    }
  }
}
