/**
 * This page owns the filtering pipeline so every destination result comes from one predictable set of rules instead of scattered condition checks.
 */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

type PopularityKey = 'all' | 'trending' | 'hidden-gems';

interface FilterState {
  search: string;
  sortBy: SortKey | null;
  categories: string[];
  popularity: Exclude<PopularityKey, 'all'> | null;
  city: string | null;
  priceFrom: number | null;
  priceTo: number | null;
}

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './destinations.html',
  styleUrl: './destinations.css'
})
export class Destinations implements OnInit, OnDestroy {
  destinations: Destination[] = [...FALLBACK_DESTINATIONS];
  filteredDestinations: Destination[] = [...FALLBACK_DESTINATIONS];

  searchTerm = '';
  selectedCity = '';
  currentPage = 1;
  readonly itemsPerPage = 9;

  userCoords: { lat: number; lng: number } | null = null;
  locationStatus = 'Select a city to enable nearest-distance sorting.';
  distanceSource = '';
  resolvingLocation = false;

  filterState: FilterState = {
    search: '',
    sortBy: null,
    categories: [],
    popularity: null,
    city: null,
    priceFrom: null,
    priceTo: null
  };

  private lastNonDistanceSort: Exclude<SortKey, 'distance-nearest'> | null = null;
  // Search updates on every keystroke, so we wait briefly before filtering to avoid
  // re-running the full pipeline for each character the user types.
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;

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

  readonly popularityOptions: { key: PopularityKey; label: string }[] = [
    { key: 'all', label: 'All popularity levels' },
    { key: 'trending', label: 'Trending Now' },
    { key: 'hidden-gems', label: 'Hidden Gems' }
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

  get selectedSorts(): SortKey[] {
    return this.filterState.sortBy ? [this.filterState.sortBy] : [];
  }

  get selectedCategories(): string[] {
    return this.filterState.categories;
  }

  get selectedPopularity(): PopularityKey {
    return this.filterState.popularity ?? 'all';
  }

  get visibleDestinations(): Destination[] {
    return this.filteredDestinations;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDestinations.length / this.itemsPerPage);
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
    return this.filteredDestinations.slice(indexOfFirstItem, indexOfLastItem);
  }

  ngOnInit(): void {
    this.destinations = this.normalizeDestinations(FALLBACK_DESTINATIONS);

    const raw = this.route.snapshot.queryParamMap.get('category') ?? '';
    const parts = raw.split(',').map((value) => value.trim()).filter(Boolean);
    this.updateFilterState('categories', this.normalizeCategorySelection(parts), false);

    this.http.get<Record<string, string>>('/assets/destination-descriptions.json').subscribe({
      next: (data) => {
        // Descriptions come from a separate asset file, so we merge them in once here
        // and keep the filtering code focused only on filtering.
        this.destinations = this.destinations.map((place) => ({
          ...place,
          description: data[place.name] ?? place.description ?? ''
        }));
        this.applyFilterPipeline();
      },
      error: () => {
        this.applyFilterPipeline();
      }
    });

    this.applyFilterPipeline();
  }

  ngOnDestroy(): void {
    if (this.searchDebounceId !== null) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
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

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCity = '';
    this.userCoords = null;
    this.distanceSource = '';
    this.locationStatus = 'Select a city to enable nearest-distance sorting.';
    this.lastNonDistanceSort = null;

    this.filterState = {
      search: '',
      sortBy: null,
      categories: [],
      popularity: null,
      city: null,
      priceFrom: null,
      priceTo: null
    };

    this.currentPage = 1;
    this.applyFilterPipeline();
  }

  onFiltersChanged(): void {
    const normalized = this.normalizeText(this.searchTerm);

    if (this.searchDebounceId !== null) {
      clearTimeout(this.searchDebounceId);
    }

    this.searchDebounceId = setTimeout(() => {
      this.updateFilterState('search', normalized);
      this.searchDebounceId = null;
    }, 300);
  }

  isSortSelected(sort: SortKey): boolean {
    return this.filterState.sortBy === sort;
  }

  toggleSort(sort: SortKey): void {
    if (this.filterState.sortBy === sort) {
      this.updateSortState(null);
      return;
    }

    if (sort === 'distance-nearest' && !this.filterState.city) {
      // Distance sorting is meaningless without a starting point, so we stop here
      // instead of pretending the sort is active.
      this.locationStatus = 'Choose a city first to sort by nearest distance.';
      return;
    }

    this.updateSortState(sort);
  }

  removeSort(sort: SortKey): void {
    if (this.filterState.sortBy !== sort) {
      return;
    }

    this.updateSortState(null);
  }

  clearSorts(): void {
    if (!this.filterState.sortBy) {
      return;
    }

    this.updateSortState(null);
  }

  sortLabel(sort: SortKey): string {
    const match = this.sortOptions.find((option) => option.key === sort);
    return match ? match.label : 'Recommended';
  }

  getSortOrder(sort: SortKey): number {
    return this.filterState.sortBy === sort ? 1 : 0;
  }

  isCategorySelected(category: string): boolean {
    return this.filterState.categories.includes(category);
  }

  toggleCategory(category: string): void {
    const key = this.normalizeCategoryKey(category);
    if (!key) {
      return;
    }

    const categories = this.filterState.categories.includes(key)
      ? this.filterState.categories.filter((value) => value !== key)
      : [...this.filterState.categories, key];

    this.updateFilterState('categories', categories);
  }

  clearCategories(): void {
    if (this.filterState.categories.length === 0) {
      return;
    }

    this.updateFilterState('categories', []);
  }

  removeCategory(category: string): void {
    if (!this.filterState.categories.includes(category)) {
      return;
    }

    this.updateFilterState(
      'categories',
      this.filterState.categories.filter((value) => value !== category)
    );
  }

  clearSearch(): void {
    if (!this.filterState.search && !this.searchTerm) {
      return;
    }

    this.searchTerm = '';
    if (this.searchDebounceId !== null) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
    this.updateFilterState('search', '');
  }

  clearLocation(): void {
    if (!this.filterState.city && !this.userCoords) {
      return;
    }

    this.selectedCity = '';
    this.userCoords = null;
    this.distanceSource = '';
    this.locationStatus = 'Select a city to enable nearest-distance sorting.';
    this.updateFilterState('city', null, false);

    if (this.filterState.sortBy === 'distance-nearest') {
      // When city is cleared, distance sort can no longer be trusted, so we move back
      // to the last non-distance sort the user had chosen.
      this.updateSortState(this.lastNonDistanceSort, false);
    }

    this.applyFilterPipeline();
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

  categoryLabel(key: string): string {
    const match = this.categoryOptions.find((category) => category.key === key);
    return match ? match.label : key;
  }

  popularityLabel(key: PopularityKey): string {
    const match = this.popularityOptions.find((option) => option.key === key);
    return match ? match.label : 'All popularity levels';
  }

  setPopularity(value: string): void {
    const normalized = this.normalizePopularityKey(value);
    this.updateFilterState('popularity', normalized === 'all' ? null : normalized);
  }

  clearPopularity(): void {
    if (this.filterState.popularity === null) {
      return;
    }

    this.updateFilterState('popularity', null);
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

    const slab = this.pricingConfig.distanceSlabs.find((item) => distanceKm <= item.maxKm);
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

  getPopularityScore(place: Destination): number {
    const baseFromRating = this.getRating(place) * 18;
    const variability = this.hashName(`${place.name}-${place.location}-${place.duration}`) % 11;
    return Math.min(100, Math.round(baseFromRating + variability));
  }

  getPopularityTag(place: Destination): PopularityKey {
    const score = this.getPopularityScore(place);
    if (score >= 90) {
      return 'trending';
    }
    if (score >= 82) {
      return 'trending';
    }
    return 'hidden-gems';
  }

  getDescriptionSnippet(place: Destination, maxLength = 140): string {
    const description = place.description?.trim();
    const fallback =
      `${place.name} in ${place.location} is a ${this.categoryLabel(this.getCategory(place))} ` +
      'destination with scenic views and local experiences.';
    const source = description || fallback;
    if (source.length <= maxLength) {
      return source;
    }
    return `${source.slice(0, maxLength - 3).trimEnd()}...`;
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
    this.locationStatus =
      this.filterState.sortBy === 'distance-nearest'
        ? `Showing nearest destinations from ${city.name}.`
        // Picking a city should not silently force a distance sort unless the user
        // has actually chosen that sort.
        : `City set to ${city.name}. Select "Distance: Nearest" to sort by proximity.`;

    this.updateFilterState('city', city.name);
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
        this.selectedCity = 'Your location';
        this.distanceSource = 'your location';
        this.locationStatus =
          this.filterState.sortBy === 'distance-nearest'
            ? 'Showing nearest destinations from your location.'
            // Browser location behaves the same as quick city selection so the user
            // never gets two different filter rules depending on how location was chosen.
            : 'Location set. Select "Distance: Nearest" to sort by proximity.';
        this.resolvingLocation = false;
        this.updateFilterState('city', 'Your location');
      },
      () => {
        this.locationStatus = 'Location permission denied or unavailable.';
        this.resolvingLocation = false;
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  trackByDestination(index: number, place: Destination): number {
    return place.id;
  }

  private updateFilterState<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
    applyImmediately = true
  ): void {
    // We only replace the field that changed so one filter never wipes out
    // the rest of the user's choices.
    this.filterState = {
      ...this.filterState,
      [key]: value
    };

    if (applyImmediately) {
      this.currentPage = 1;
      this.applyFilterPipeline();
    }
  }

  private updateSortState(sortBy: SortKey | null, applyImmediately = true): void {
    if (sortBy && sortBy !== 'distance-nearest') {
      // We keep track of the last "normal" sort so clearing a city can safely
      // fall back to something the user actually chose before.
      this.lastNonDistanceSort = sortBy;
    }

    this.filterState = {
      ...this.filterState,
      sortBy
    };

    if (applyImmediately) {
      this.currentPage = 1;
      this.applyFilterPipeline();
    }
  }

  private applyFilterPipeline(): void {
    // Every filter step works from the output of the previous one. That keeps
    // combined filters predictable and avoids special-case behavior.
    let items = [...this.destinations];

    items = this.applySearchFilter(items);
    items = this.applyCategoryFilter(items);
    items = this.applyPopularityFilter(items);
    items = this.applyPriceRangeFilter(items);
    items = this.applyCityFilter(items);
    items = this.applySort(items);

    this.filteredDestinations = items;

    if (this.totalPages > 0) {
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    } else {
      this.currentPage = 1;
    }
  }

  private applySearchFilter(items: Destination[]): Destination[] {
    const term = this.filterState.search;
    if (!term) {
      return items;
    }

    return items.filter((place) => {
      // Search is intentionally broad so people can type whatever they remember
      // about a destination and still find it.
      const haystack = [
        place.name,
        place.location,
        this.getState(place),
        this.categoryLabel(this.getCategory(place)),
        place.description || this.getDescriptionSnippet(place, 240)
      ]
        .map((value) => this.normalizeText(value))
        .join(' ');

      return haystack.includes(term);
    });
  }

  private applyCategoryFilter(items: Destination[]): Destination[] {
    if (this.filterState.categories.length === 0) {
      return items;
    }

    // Multi-select categories use OR logic because people expect "Temples + Forests"
    // to widen results, not narrow them to impossible overlaps.
    return items.filter((place) => this.filterState.categories.includes(this.getCategory(place)));
  }

  private applyPopularityFilter(items: Destination[]): Destination[] {
    if (this.filterState.popularity === null) {
      return items;
    }

    return items.filter((place) => this.getPopularityTag(place) === this.filterState.popularity);
  }

  private applyPriceRangeFilter(items: Destination[]): Destination[] {
    const { priceFrom, priceTo } = this.filterState;
    if (priceFrom === null && priceTo === null) {
      return items;
    }

    return items.filter((place) => {
      const price = this.getPrice(place);
      if (priceFrom !== null && price < priceFrom) {
        return false;
      }
      if (priceTo !== null && price > priceTo) {
        return false;
      }
      return true;
    });
  }

  private applyCityFilter(items: Destination[]): Destination[] {
    // City selection does not remove destinations by itself. It exists to support
    // distance-based pricing and sorting without hiding destinations unexpectedly.
    if (!this.filterState.city || !this.userCoords) {
      return items;
    }

    return items;
  }

  private applySort(items: Destination[]): Destination[] {
    const sorted = [...items];
    const sortBy = this.filterState.sortBy;

    if (!sortBy) {
      // "Recommended" is our safe default when no explicit sort is active.
      return sorted.sort((a, b) => this.compareRecommended(a, b));
    }

    if (sortBy === 'distance-nearest' && !this.filterState.city) {
      // If distance sort somehow survives without a city, we intentionally fall back
      // instead of returning a misleading order.
      return sorted.sort((a, b) => this.compareRecommended(a, b));
    }

    return sorted.sort((a, b) => {
      const primaryDiff = this.compareBySort(a, b, sortBy);
      if (primaryDiff !== 0) {
        return primaryDiff;
      }
      return this.compareRecommended(a, b);
    });
  }

  private compareBySort(a: Destination, b: Destination, sortBy: SortKey): number {
    switch (sortBy) {
      case 'price-low':
        return this.getPrice(a) - this.getPrice(b);
      case 'price-high':
        return this.getPrice(b) - this.getPrice(a);
      case 'distance-nearest':
        return this.getDistanceKm(a) - this.getDistanceKm(b);
      case 'rating-highest':
        return this.getRating(b) - this.getRating(a);
      case 'time-shortest':
        return this.getDays(a) - this.getDays(b);
      case 'alpha-az':
        return a.name.localeCompare(b.name);
      case 'alpha-za':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  }

  private compareRecommended(a: Destination, b: Destination): number {
    // Default ordering should feel useful to a traveler, so we favor destinations
    // that look more popular before falling back to name order.
    const popularityDiff = this.getPopularityScore(b) - this.getPopularityScore(a);
    if (popularityDiff !== 0) {
      return popularityDiff;
    }

    const ratingDiff = this.getRating(b) - this.getRating(a);
    if (ratingDiff !== 0) {
      return ratingDiff;
    }

    return a.name.localeCompare(b.name);
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

  private normalizePopularityKey(value: string): PopularityKey {
    const key = value.trim().toLowerCase();
    const allowed = new Set(this.popularityOptions.map((option) => option.key));
    return allowed.has(key as PopularityKey) ? (key as PopularityKey) : 'all';
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private buildFallbackImage(name: string, location?: string): string {
    const query = `${name} ${location ?? ''} south india`.trim();
    return `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
  }

  private normalizeDestinations(destinations: Destination[]): Destination[] {
    return destinations.map((place) => ({
      ...place,
      image: this.resolveImage(place)
    }));
  }

  private resolveImage(place: Destination): string {
    const raw = place.image?.trim();
    if (!raw) {
      return this.buildFallbackImage(place.name, place.location);
    }

    if (this.isLikelyBrokenImage(raw)) {
      return this.buildFallbackImage(place.name, place.location);
    }

    return raw;
  }

  private isLikelyBrokenImage(url: string): boolean {
    if (url.endsWith('/')) {
      return true;
    }

    const lower = url.toLowerCase();
    if (lower.includes('_next/image')) {
      return true;
    }

    if (lower.includes('mm.bing.net')) {
      return true;
    }

    if (lower.includes('blogger.googleusercontent.com/img/b/') && lower.endsWith('/')) {
      return true;
    }

    return false;
  }

  private hashName(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
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

    const exact = this.cityOptions.find((city) => this.normalizeCityKey(city.name) === resolvedKey);
    if (exact) {
      return exact;
    }

    const startsWith = this.cityOptions.find((city) =>
      this.normalizeCityKey(city.name).startsWith(resolvedKey)
    );
    if (startsWith) {
      return startsWith;
    }

    return this.cityOptions.find((city) => this.normalizeCityKey(city.name).includes(resolvedKey));
  }

  private normalizeCityKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}

