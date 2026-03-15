import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Destination, FALLBACK_DESTINATIONS } from '../../data/destinations-data';

interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

type SortKey =
  | 'price-low'
  | 'price-high'
  | 'distance-nearest'
  | 'rating-highest'
  | 'time-shortest'
  | 'alpha-az'
  | 'alpha-za';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './destinations.html',
  styleUrl: './destinations.css'
})
export class Destinations implements OnInit {
  destinations: Destination[] = [...FALLBACK_DESTINATIONS];
  searchTerm = '';
  selectedSorts: SortKey[] = [];
  selectedCategories: string[] = [];
  currentPage = 1;
  readonly itemsPerPage = 9;
  selectedCity = '';
  userCoords: { lat: number; lng: number } | null = null;
  locationStatus = 'Select a city to sort by nearest distance.';
  distanceSource = '';
  resolvingLocation = false;
  private readonly pricingConfig = {
    baseFare: 1999,
    perDayFare: 1800,
    distanceSlabs: [
      { maxKm: 150, surcharge: 0 },
      { maxKm: 400, surcharge: 600 },
      { maxKm: 800, surcharge: 1400 },
      { maxKm: 1400, surcharge: 2600 },
      { maxKm: Number.POSITIVE_INFINITY, surcharge: 3800 }
    ]
  };
  readonly cityOptions: CityOption[] = [
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
    { name: 'Mangalore', lat: 12.9141, lng: 74.8560 },
    { name: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
    { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
    { name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
    { name: 'Nellore', lat: 14.4426, lng: 79.9865 },
    { name: 'Rajahmundry', lat: 17.0005, lng: 81.8040 },
    { name: 'Warangal', lat: 17.9689, lng: 79.5941 },
    { name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
    { name: 'Khammam', lat: 17.2473, lng: 80.1514 },
    { name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
    { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
    { name: 'Kollam', lat: 8.8932, lng: 76.6141 },
    { name: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460 },
    { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
    { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
    { name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Noida', lat: 28.5355, lng: 77.3910 },
    { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
    { name: 'Agra', lat: 27.1767, lng: 78.0081 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { name: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
    { name: 'Shimla', lat: 31.1048, lng: 77.1734 },
    { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
    { name: 'Haridwar', lat: 29.9457, lng: 78.1642 },
    { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
    { name: 'Leh', lat: 34.1526, lng: 77.5770 },
    { name: 'Jammu', lat: 32.7266, lng: 74.8570 },
    { name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { name: 'Indore', lat: 22.7196, lng: 75.8577 }
  ];

  readonly categoryOptions = [
    { key: 'temples', label: 'Temples' },
    { key: 'backwaters', label: 'Backwaters' },
    { key: 'forests', label: 'Forests' },
    { key: 'hill-stations', label: 'Hill Stations' },
    { key: 'heritage', label: 'Heritage & Cities' }
  ];

  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'distance-nearest', label: 'Distance: Nearest' },
    { key: 'alpha-az', label: 'Alphabetical: A to Z' },
    { key: 'alpha-za', label: 'Alphabetical: Z to A' },
    { key: 'price-low', label: 'Price: Low to High' },
    { key: 'price-high', label: 'Price: High to Low' },
    { key: 'rating-highest', label: 'Ratings: Highest Rated' },
    { key: 'time-shortest', label: 'Travel Time: Shortest' }
  ];

  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

  constructor(private readonly route: ActivatedRoute, private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.destinations = [...FALLBACK_DESTINATIONS];
    const raw = this.route.snapshot.queryParamMap.get('category') ?? '';
    const parts = raw.split(',').map((value) => value.trim()).filter(Boolean);
    this.selectedCategories = this.normalizeCategorySelection(parts);

    this.http
      .get<Record<string, string>>('/assets/destination-descriptions.json')
      .subscribe({
        next: (data) => {
          this.destinations = this.destinations.map((place) => ({
            ...place,
            description: data[place.name] ?? ''
          }));
        },
        error: () => {
          // Keep fallback descriptions empty if the endpoint fails.
        }
      });
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

  get visibleDestinations(): Destination[] {
    const term = this.normalizeText(this.searchTerm);
    const selectedCategories = this.selectedCategories;
    const selectedSorts = this.selectedSorts;
    let items = [...this.destinations];

    const matchesSearch = (place: Destination): boolean => {
      if (!term) {
        return true;
      }
      const name = this.normalizeText(place.name);
      const location = this.normalizeText(place.location);
      const state = this.normalizeText(this.getState(place));
      return name.includes(term) || location.includes(term) || state.includes(term);
    };

    const matchesCategory = (place: Destination): boolean =>
      selectedCategories.length === 0 || selectedCategories.includes(this.getCategory(place));

    items = items.filter((place) => matchesSearch(place) && matchesCategory(place));

    // Apply sorting with proper multi-criteria handling
    if (selectedSorts.length === 0) {
      // Default sorting when no sorts selected
      items.sort((a, b) => {
        // Primary: alphabetical by name
        const nameDiff = a.name.localeCompare(b.name);
        if (nameDiff !== 0) return nameDiff;
        
        // Secondary: by rating (highest first)
        const ratingDiff = this.getRating(b) - this.getRating(a);
        if (ratingDiff !== 0) return ratingDiff;
        
        // Tertiary: by price (lowest first)
        return this.getPrice(a) - this.getPrice(b);
      });
    } else {
      // Apply user-selected sorts with proper tie-breaking
      items.sort((a, b) => this.compareBySorts(a, b, selectedSorts));
    }

    return items;
  }

  get totalPages(): number {
    return Math.ceil(this.visibleDestinations.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedDestinations(): Destination[] {
    const totalPages = this.totalPages;
    if (totalPages === 0) {
      return [];
    }

    const currentPage = Math.min(this.currentPage, totalPages);
    const indexOfLastItem = currentPage * this.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - this.itemsPerPage;
    return this.visibleDestinations.slice(indexOfFirstItem, indexOfLastItem);
  }

  getState(place: Destination): string {
    const parts = place.location.split(',');
    return parts[parts.length - 1].trim();
  }

  getDays(place: Destination): number {
    const match = place.duration.match(/(\d+)\s*D/i);
    return match ? Number(match[1]) : 2;
  }

  getPrice(place: Destination): number {
    const days = this.getDays(place);
    const distanceKm = this.userCoords
      ? this.getDistanceKm(place)
      : 120 + (this.hashName(place.location) % 1500);

    const slab = this.pricingConfig.distanceSlabs.find((s) => distanceKm <= s.maxKm);
    const distanceSurcharge = slab ? slab.surcharge : 0;

    return this.pricingConfig.baseFare + days * this.pricingConfig.perDayFare + distanceSurcharge;
  }

  getDistanceKm(place: Destination): number {
    if (!this.userCoords) {
      return Number.POSITIVE_INFINITY;
    }
    return this.haversineKm(
      this.userCoords.lat,
      this.userCoords.lng,
      place.coords.lat,
      place.coords.lng
    );
  }

  getRating(place: Destination): number {
    const value = 3.7 + (this.hashName(place.name + place.location) % 14) / 10;
    return Number(Math.min(value, 5).toFixed(1));
  }

  getCategory(place: Destination): string {
    const key = `${place.name} ${place.location}`.toLowerCase();
    if (
      key.includes('temple') ||
      key.includes('tirupati') ||
      key.includes('tirupathi') ||
      key.includes('guruvayur')
    ) {
      return 'temples';
    }
    if (key.includes('backwaters') || key.includes('alleppey')) {
      return 'backwaters';
    }
    if (key.includes('wayanad') || key.includes('forest')) {
      return 'forests';
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
      return 'hill-stations';
    }
    return 'heritage';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSorts = [];
    this.selectedCategories = [];
    this.selectedCity = '';
    this.userCoords = null;
    this.distanceSource = '';
    this.locationStatus = 'Select a city to sort by nearest distance.';
    this.currentPage = 1;
  }

  onFiltersChanged(): void {
    this.selectedCategories = this.normalizeCategorySelection(this.selectedCategories);
    this.selectedSorts = this.normalizeSortSelection(this.selectedSorts);
    this.currentPage = 1;
  }

  isSortSelected(sort: SortKey): boolean {
    return this.selectedSorts.includes(sort);
  }

  toggleSort(sort: SortKey): void {
    if (this.selectedSorts.includes(sort)) {
      this.selectedSorts = this.selectedSorts.filter((value) => value !== sort);
    } else {
      this.selectedSorts = [...this.selectedSorts, sort];
    }
    this.onFiltersChanged();
  }

  removeSort(sort: SortKey): void {
    if (!this.selectedSorts.includes(sort)) {
      return;
    }
    this.selectedSorts = this.selectedSorts.filter((value) => value !== sort);
    this.onFiltersChanged();
  }

  clearSorts(): void {
    if (this.selectedSorts.length === 0) {
      return;
    }
    this.selectedSorts = [];
    this.onFiltersChanged();
  }

  sortLabel(sort: SortKey): string {
    const match = this.sortOptions.find((option) => option.key === sort);
    return match ? match.label : sort;
  }

  getSortOrder(sort: SortKey): number {
    return this.selectedSorts.indexOf(sort) + 1;
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  toggleCategory(category: string): void {
    const key = this.normalizeCategoryKey(category);
    if (!key) {
      return;
    }
    if (this.selectedCategories.includes(key)) {
      this.selectedCategories = this.selectedCategories.filter((value) => value !== key);
    } else {
      this.selectedCategories = [...this.selectedCategories, key];
    }
    this.onFiltersChanged();
  }

  clearCategories(): void {
    if (this.selectedCategories.length === 0) {
      return;
    }
    this.selectedCategories = [];
    this.onFiltersChanged();
  }

  removeCategory(category: string): void {
    if (!this.selectedCategories.includes(category)) {
      return;
    }
    this.selectedCategories = this.selectedCategories.filter((value) => value !== category);
    this.onFiltersChanged();
  }

  clearSearch(): void {
    if (!this.searchTerm) {
      return;
    }
    this.searchTerm = '';
    this.onFiltersChanged();
  }

  clearLocation(): void {
    if (!this.userCoords) {
      return;
    }
    this.selectedCity = '';
    this.userCoords = null;
    this.distanceSource = '';
    this.locationStatus = 'Select a city to sort by nearest distance.';
    this.onFiltersChanged();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  private normalizeCategoryKey(value: string): string | null {
    const key = value.trim().toLowerCase();
    const allowed = this.categoryOptions.some((category) => category.key === key);
    return allowed ? key : null;
  }

  private normalizeCategorySelection(values: string[]): string[] {
    const unique = new Set<string>();
    for (const value of values) {
      const key = this.normalizeCategoryKey(value);
      if (key) {
        unique.add(key);
      }
    }
    return Array.from(unique);
  }

  categoryLabel(key: string): string {
    const match = this.categoryOptions.find((category) => category.key === key);
    return match ? match.label : key;
  }

  private normalizeSortSelection(values: SortKey[]): SortKey[] {
    const allowed = new Set(this.sortOptions.map((option) => option.key));
    const unique = new Set<SortKey>();
    for (const value of values) {
      if (allowed.has(value)) {
        unique.add(value);
      }
    }
    return Array.from(unique);
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private buildFallbackImage(name: string, location?: string): string {
    const query = `${name} ${location ?? ''} south india`.trim();
    return `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
  }

  toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private hashName(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private compareBySorts(a: Destination, b: Destination, sorts: SortKey[]): number {
    // If no sorts selected, use default sorting
    if (sorts.length === 0) {
      // Default: alphabetical by name, then by rating (highest), then by price (lowest)
      const nameDiff = a.name.localeCompare(b.name);
      if (nameDiff !== 0) return nameDiff;
      
      const ratingDiff = this.getRating(b) - this.getRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      
      return this.getPrice(a) - this.getPrice(b);
    }

    // Apply multiple sort criteria in order
    for (const sort of sorts) {
      let diff = 0;
      switch (sort) {
        case 'price-low':
          diff = this.getPrice(a) - this.getPrice(b);
          break;
        case 'price-high':
          diff = this.getPrice(b) - this.getPrice(a);
          break;
        case 'distance-nearest':
          if (!this.userCoords) {
            diff = 0;
            break;
          }
          diff = this.getDistanceKm(a) - this.getDistanceKm(b);
          break;
        case 'rating-highest':
          diff = this.getRating(b) - this.getRating(a);
          break;
        case 'time-shortest':
          diff = this.getDays(a) - this.getDays(b);
          break;
        case 'alpha-az':
          diff = a.name.localeCompare(b.name);
          break;
        case 'alpha-za':
          diff = b.name.localeCompare(a.name);
          break;
      }
      // Only return if we have a definitive difference for this sort criteria
      if (diff !== 0) {
        return diff;
      }
      // If diff is 0, continue to next sort criteria for tie-breaking
    }
    
    // If all sort criteria result in ties, fall back to default sorting
    const nameDiff = a.name.localeCompare(b.name);
    if (nameDiff !== 0) return nameDiff;
    
    const ratingDiff = this.getRating(b) - this.getRating(a);
    if (ratingDiff !== 0) return ratingDiff;
    
    return this.getPrice(a) - this.getPrice(b);
  }

  applyQuickCity(): void {
    const city = this.findCityFromLocal(this.selectedCity);
    if (!city) {
      this.locationStatus = 'Please choose a city from the list.';
      return;
    }
    this.selectedCity = city.name;
    this.userCoords = { lat: city.lat, lng: city.lng };
    this.distanceSource = city.name;
    if (this.selectedSorts.length === 0) {
      this.selectedSorts = ['distance-nearest'];
    }
    this.locationStatus = `Showing distance from ${city.name} (approx. straight-line).`;
    this.onFiltersChanged();
  }

  useBrowserLocation(): void {
    if (!navigator.geolocation) {
      this.locationStatus = 'Geolocation is not supported in this browser.';
      return;
    }

    this.resolvingLocation = true;
    this.locationStatus = 'Fetching your current location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.distanceSource = 'your location';
        if (this.selectedSorts.length === 0) {
          this.selectedSorts = ['distance-nearest'];
        }
        this.locationStatus = 'Showing distance from your location (approx. straight-line).';
        this.resolvingLocation = false;
        this.onFiltersChanged();
      },
      () => {
        this.locationStatus = 'Location permission denied or unavailable.';
        this.resolvingLocation = false;
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusKm * c);
  }

  private findCityFromLocal(value: string): CityOption | undefined {
    const key = this.normalizeCityKey(value);
    if (!key) {
      return undefined;
    }

    const aliases: Record<string, string> = {
      bangalore: 'bengaluru',
      trivandrum: 'thiruvananthapuram'
    };
    const resolvedKey = aliases[key] ?? key;

    const exact = this.cityOptions.find((c) => this.normalizeCityKey(c.name) === resolvedKey);
    if (exact) {
      return exact;
    }

    const startsWith = this.cityOptions.find((c) =>
      this.normalizeCityKey(c.name).startsWith(resolvedKey)
    );
    if (startsWith) {
      return startsWith;
    }

    return this.cityOptions.find((c) => this.normalizeCityKey(c.name).includes(resolvedKey));
  }

  private normalizeCityKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  trackByDestination(index: number, place: Destination): string {
    return place.name;
  }
}

