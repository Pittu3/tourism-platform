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
  featuredDestinations = [
    {
      name: 'Munnar Tea Trails',
      duration: '4D / 3N',
      image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=900&q=80',
      description: 'Tea gardens, waterfalls, and scenic mountain drives.'
    },
    {
      name: 'Coorg Coffee Escape',
      duration: '5D / 4N',
      image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?auto=format&fit=crop&w=900&q=80',
      description: 'Plantation stays, river rafting, and nature trails.'
    },
    {
      name: 'Pondicherry Weekend',
      duration: '3D / 2N',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=80',
      description: 'French quarter walks, beach sunsets, and cafe hopping.'
    }
  ];
}
