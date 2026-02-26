import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './highlights.html',
  styleUrl: './highlights.css'
})
export class Highlights {
  valuePoints = [
    { metric: '150+', label: 'South India routes' },
    { metric: '4.8/5', label: 'Average traveler rating' },
    { metric: '24/7', label: 'On-trip assistance' },
    { metric: '100%', label: 'Verified local partners' }
  ];

  featuredDestinations = [
    {
      name: 'Munnar Tea Trails',
      duration: '4D / 3N',
      image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=900&q=80',
      description: 'Tea gardens, waterfalls, mountain views.'
    },
    {
      name: 'Coorg Coffee Escape',
      duration: '5D / 4N',
      image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?auto=format&fit=crop&w=900&q=80',
      description: 'Plantation stays, river rafting, and nature trails.'
    },
    {
      name: 'Kochi Cultural Weekend',
      duration: '3D / 2N',
      image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/de/f0/eb/backwater-tourism.jpg?w=700&h=-1&s=1',
      description: 'Fort Kochi walks, art cafes, and harbor evenings.'
    }
  ];
}
