import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonals.html',
  styleUrl: './testimonals.css'
})
export class Testimonals {
  reviews = [
    {
      name: 'Sai Charan',
      trip: 'Temple + Heritage Circuit',
      feedback: 'Excellent planning, clean stays, and smooth transfers throughout the trip.',
      rating: 5
    },
    {
      name: 'Ananya Reddy',
      trip: 'Kerala Backwaters',
      feedback: 'Houseboat experience and local support were outstanding from start to finish.',
      rating: 5
    },
    {
      name: 'Rahul Kumar',
      trip: 'Munnar + Thekkady',
      feedback: 'Great value itinerary with flexible timings and responsive support team.',
      rating: 4
    }
  ];
}
