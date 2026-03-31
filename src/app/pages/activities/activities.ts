import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Activity, FirestoreService } from '../../services/firestore.service';

type SortBy = 'popularity' | 'title' | 'category';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.html',
  styleUrl: './activities.css'
})
export class Activities implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);
  private readonly subscriptions = new Subscription();
  private readonly manualActivities: Activity[] = [
    {
      id: 'local-hampi-rock-climbing',
      title: 'Hampi Rock Climbing',
      description:
        'Guided granite boulder climbing session across scenic Hampi circuits for beginners and intermediate climbers.',
      location: 'Hampi',
      category: 'Adventure',
      imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851',
      price: 1200,
      priceRange: 'Starting from Rs. 1200',
      popularity: 92,
      rating: 4.7,
      duration: '3-4 hours',
      bestSeason: 'October to February'
    },
    {
      id: 'local-araku-zipline-adventure',
      title: 'Araku Valley Zipline Adventure',
      description:
        'Zipline over the lush Araku valley viewpoints with trained guides and safety harness support.',
      location: 'Andhra Pradesh',
      category: 'Adventure',
      imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
      price: 1400,
      priceRange: 'Starting from Rs. 1400',
      popularity: 89,
      rating: 4.6,
      duration: '2-3 hours',
      bestSeason: 'September to February'
    },
    {
      id: 'local-yelagiri-paragliding-experience',
      title: 'Yelagiri Paragliding Experience',
      description:
        'Tandem paragliding over Yelagiri hills with certified instructors and panoramic valley views.',
      location: 'Tamil Nadu',
      category: 'Adventure',
      imageUrl: 'https://images.unsplash.com/photo-1504198266285-165a94a0a9f9',
      price: 2500,
      priceRange: 'Starting from Rs. 2500',
      popularity: 94,
      rating: 4.8,
      duration: '2 hours',
      bestSeason: 'October to March'
    },
    {
      id: 'local-coorg-coffee-plantation-walk',
      title: 'Coorg Coffee Plantation Walk',
      description:
        'Guided walk through aromatic coffee estates in Coorg with local storytelling and plantation insights.',
      location: 'Karnataka',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      price: 900,
      priceRange: 'Starting from Rs. 900',
      popularity: 86,
      rating: 4.5,
      duration: '2-3 hours',
      bestSeason: 'November to February'
    },
    {
      id: 'local-rishikesh-white-water-rafting',
      title: 'Rishikesh White Water Rafting',
      description:
        'Thrilling guided white water rafting session on the Ganga with certified safety support and gear.',
      location: 'Uttarakhand',
      category: 'Water',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      price: 1800,
      priceRange: 'Starting from Rs. 1800',
      popularity: 91,
      rating: 4.7,
      duration: '3 hours',
      bestSeason: 'September to June'
    },
    {
      id: 'local-goa-scuba-diving-experience',
      title: 'Goa Scuba Diving Experience',
      description:
        'Beginner-friendly scuba session with instructor guidance, safety briefing, and reef exploration.',
      location: 'Goa',
      category: 'Water',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      price: 3500,
      priceRange: 'Starting from Rs. 3500',
      popularity: 93,
      rating: 4.8,
      duration: '3-4 hours',
      bestSeason: 'October to May'
    },
    {
      id: 'local-alleppey-houseboat-stay',
      title: 'Alleppey Houseboat Stay',
      description:
        'Relaxing overnight houseboat cruise through Kerala backwaters with local cuisine and scenic views.',
      location: 'Kerala',
      category: 'Relaxation',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      price: 5000,
      priceRange: 'Starting from Rs. 5000',
      popularity: 95,
      rating: 4.9,
      duration: '1 day / 1 night',
      bestSeason: 'September to March'
    },
    {
      id: 'local-ooty-toy-train-experience',
      title: 'Ooty Toy Train Experience',
      description:
        'Scenic heritage train ride through Nilgiri hills, tunnels, and tea estates with panoramic viewpoints.',
      location: 'Tamil Nadu',
      category: 'Cultural',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      price: 800,
      priceRange: 'Starting from Rs. 800',
      popularity: 84,
      rating: 4.4,
      duration: '2 hours',
      bestSeason: 'October to June'
    }
  ];

  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  categories: string[] = [];
  favoriteIds = new Set<string>();
  currentPage = 1;
  readonly itemsPerPage = 9;

  searchTerm = '';
  selectedCategory = 'all';
  sortBy: SortBy = 'popularity';
  selectedActivity: Activity | null = null;

  loading = true;
  errorMessage = '';

  get totalPages(): number {
    return Math.ceil(this.filteredActivities.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginatedActivities(): Activity[] {
    const totalPages = this.totalPages;
    if (totalPages === 0) {
      return [];
    }

    const currentPage = Math.min(this.currentPage, totalPages);
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    return this.filteredActivities.slice(startIndex, startIndex + this.itemsPerPage);
  }

  ngOnInit(): void {
    // Always show local fallback activities immediately.
    this.activities = [...this.manualActivities];
    this.categories = this.buildCategories(this.activities);
    this.applyFilters();
    this.loading = false;

    const activitiesSubscription = this.firestoreService.getActivities().subscribe({
      next: (activities) => {
        this.loading = false;
        this.errorMessage = '';
        const mergedActivities = this.mergeWithManualActivities(activities);
        this.activities = mergedActivities;
        this.categories = this.buildCategories(mergedActivities);
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        // Keep fallback cards visible even when Firestore is unavailable.
        const mergedActivities = this.mergeWithManualActivities([]);
        this.activities = mergedActivities;
        this.categories = this.buildCategories(mergedActivities);
        this.applyFilters();
        this.errorMessage = '';
      }
    });

    this.subscriptions.add(activitiesSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearchOrFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
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

  toggleFavorite(activityId: string): void {
    if (this.favoriteIds.has(activityId)) {
      this.favoriteIds.delete(activityId);
    } else {
      this.favoriteIds.add(activityId);
    }
  }

  isFavorite(activityId: string): boolean {
    return this.favoriteIds.has(activityId);
  }

  openDetail(activity: Activity): void {
    this.selectedActivity = activity;
  }

  closeDetail(): void {
    this.selectedActivity = null;
  }

  trackById(index: number, activity: Activity): string {
    return activity.id;
  }

  getRating(activity: Activity): number {
    if (typeof activity.rating === 'number') {
      return Number(activity.rating.toFixed(1));
    }
    const computed = 3.8 + (this.hash(activity.id + activity.title) % 12) / 10;
    return Number(computed.toFixed(1));
  }

  getStars(activity: Activity): number[] {
    const filledStars = Math.max(1, Math.min(5, Math.round(this.getRating(activity))));
    return Array.from({ length: filledStars }, (_, index) => index);
  }

  getDisplayPrice(activity: Activity): string {
    if (typeof activity.price === 'number') {
      return `Rs. ${activity.price}`;
    }

    if (activity.priceRange && activity.priceRange.trim().length > 0) {
      return activity.priceRange;
    }

    return 'Contact for pricing';
  }

  private applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();

    const filtered = this.activities.filter((activity) => {
      const matchesSearch =
        keyword.length === 0 ||
        activity.title.toLowerCase().includes(keyword) ||
        activity.location.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword);

      const matchesCategory =
        this.selectedCategory === 'all' ||
        activity.category.toLowerCase() === this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    filtered.sort((first, second) => {
      if (this.sortBy === 'title') {
        return first.title.localeCompare(second.title);
      }

      if (this.sortBy === 'category') {
        return first.category.localeCompare(second.category);
      }

      const firstPopularity = typeof first.popularity === 'number' ? first.popularity : 0;
      const secondPopularity = typeof second.popularity === 'number' ? second.popularity : 0;
      return secondPopularity - firstPopularity;
    });

    this.filteredActivities = filtered;

    if (this.totalPages > 0) {
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    } else {
      this.currentPage = 1;
    }
  }

  private buildCategories(activities: Activity[]): string[] {
    const uniqueCategories = new Set(
      activities
        .map((activity) => activity.category.trim())
        .filter((category) => category.length > 0)
    );

    return Array.from(uniqueCategories).sort((first, second) => first.localeCompare(second));
  }

  private mergeWithManualActivities(firestoreActivities: Activity[]): Activity[] {
    const merged = [...firestoreActivities];

    for (const manualActivity of this.manualActivities) {
      const exists = merged.some(
        (activity) =>
          activity.title.toLowerCase() === manualActivity.title.toLowerCase() &&
          activity.location.toLowerCase() === manualActivity.location.toLowerCase()
      );

      if (!exists) {
        merged.push(manualActivity);
      }
    }

    return merged;
  }

  private hash(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }
}
