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
      name: 'Aarav Shah',
      trip: 'Kerala Backwaters',
      feedback: 'The itinerary was smooth, hotels were clean, and local guides were excellent.',
      rating: 5
    },
    {
      name: 'Naina Verma',
      trip: 'Leh-Ladakh Explorer',
      feedback: 'Super organized trip with amazing support during altitude changes.',
      rating: 5
    },
    {
      name: 'Rohan Mehta',
      trip: 'Ooty + Coonoor',
      feedback: 'Great value package and flexible schedule. Perfect for our family vacation.',
      rating: 4
    }
  ];
}
