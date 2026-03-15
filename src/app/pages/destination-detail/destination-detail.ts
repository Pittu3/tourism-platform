import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Destination, FALLBACK_DESTINATIONS } from '../../data/destinations-data';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.css'
})
export class DestinationDetail implements OnInit {
  destination: Destination | null = null;
  notFound = false;

  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

  constructor(private readonly route: ActivatedRoute, private readonly http: HttpClient) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const match = FALLBACK_DESTINATIONS.find((place) => this.toSlug(place.name) === slug);

    if (!match) {
      this.notFound = true;
      return;
    }

    this.destination = { ...match };

    this.http.get<Record<string, string>>('/assets/destination-descriptions.json').subscribe({
      next: (data) => {
        this.destination = {
          ...match,
          description: data[match.name] ?? ''
        };
      },
      error: () => {
        this.destination = { ...match };
      }
    });
  }

  toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  getState(place: Destination): string {
    const parts = place.location.split(',');
    return parts[parts.length - 1].trim();
  }

  getCategory(place: Destination): string {
    const key = `${place.name} ${place.location}`.toLowerCase();
    if (
      key.includes('temple') ||
      key.includes('tirupati') ||
      key.includes('tirupathi') ||
      key.includes('guruvayur')
    ) {
      return 'Temples';
    }
    if (key.includes('backwaters') || key.includes('alleppey')) {
      return 'Backwaters';
    }
    if (key.includes('wayanad') || key.includes('forest')) {
      return 'Forests';
    }
    if (
      key.includes('ooty') ||
      key.includes('yercaud') ||
      key.includes('coonoor') ||
      key.includes('chikmagalur') ||
      key.includes('sakleshpur') ||
      key.includes('horsley hills') ||
      key.includes('lambasingi') ||
      key.includes('kodaikanal') ||
      key.includes('munnar') ||
      key.includes('coorg')
    ) {
      return 'Hill Stations';
    }
    return 'Heritage & Cities';
  }

  getRating(place: Destination): number {
    const value = 3.7 + (this.hashName(place.name + place.location) % 14) / 10;
    return Number(Math.min(value, 5).toFixed(1));
  }

  getNearestAirport(place: Destination): string {
    const key = place.name.toLowerCase();
    const airportMap: Record<string, string> = {
      'tirupati': 'Tirupati Airport (TIR)',
      'munnar': 'Cochin International Airport (COK)',
      'ooty': 'Coimbatore International Airport (CJB)',
      'wayanad': 'Calicut International Airport (CCJ)',
      'kodaikanal': 'Madurai Airport (IXM)',
      'alleppey': 'Cochin International Airport (COK)',
      'chikmagalur': 'Mangalore International Airport (IXE)',
      'coorg': 'Mangalore International Airport (IXE)',
      'kochi': 'Cochin International Airport (COK)',
      'mangalore': 'Mangalore International Airport (IXE)',
      'mysuru': 'Mysore Airport (MYQ)',
      'bengaluru': 'Kempegowda International Airport (BLR)',
      'chennai': 'Chennai International Airport (MAA)',
      'hyderabad': 'Rajiv Gandhi International Airport (HYD)'
    };
    
    for (const [city, airport] of Object.entries(airportMap)) {
      if (key.includes(city)) {
        return airport;
      }
    }
    return 'Nearest major airport';
  }

  onImageError(event: Event, placeName: string, placeLocation?: string): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) {
      return;
    }

    const queryFallback = this.buildFallbackImage(placeName, placeLocation);
    if (img.src !== queryFallback && img.src !== this.fallbackImage) {
      img.src = queryFallback;
      return;
    }

    if (img.src !== this.fallbackImage) {
      img.src = this.fallbackImage;
    }
  }

  private buildFallbackImage(name: string, location?: string): string {
    const query = `${name} ${location ?? ''} south india`.trim();
    return `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
  }

  private hashName(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}
