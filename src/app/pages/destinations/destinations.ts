import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

interface Destination {
  name: string;
  location: string;
  duration: string;
  image: string;
  description: string;
  coords: {
    lat: number;
    lng: number;
  };
}

interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

const FALLBACK_DESTINATIONS: Destination[] = [
  {
    name: 'Tirumala Tirupathi',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://3.bp.blogspot.com/-eKlAydd6GDw/U9DtLeczIzI/AAAAAAAAFmo/6RMDHTcIH4Q/s1600/Tirupati+Balaji+Temple.jpg',
    description: 'Sacred hills and blessings.',
    coords: { lat: 13.6833, lng: 79.3470 }
  },
  {
    name: 'Meenakshi Amman Temple',
    location: 'Madurai, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://static.toiimg.com/thumb/msid-59381768,width=1200,height=900/59381768.jpg',
    description: 'Colorful towers, divine heritage.',
    coords: { lat: 9.9195, lng: 78.1193 }
  },
  {
    name: 'Ramanathaswamy Temple',
    location: 'Rameswaram, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse1.mm.bing.net/th/id/OIP.dhWy2r5QUmisr1derQSL8AHaEK?pid=Api&P=0&h=220',
    description: 'Legendary corridors, sacred rituals.',
    coords: { lat: 9.2881, lng: 79.3174 }
  },
  {
    name: 'Brihadeeswarar Temple',
    location: 'Thanjavur, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://i.ytimg.com/vi/KC3GAmjn1mg/maxresdefault.jpg',
    description: 'Majestic Chola stone masterpiece.',
    coords: { lat: 10.7828, lng: 79.1317 }
  },
  {
    name: 'Chidambaram Nataraja Temple',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://hblimg.mmtcdn.com/content/hubble/img/ttd_images_march/mmt/activities/m_Chidambaram_the_nataraja_temple_1_l_667_1000.jpg',
    description: 'Cosmic dance and devotion.',
    coords: { lat: 11.3996, lng: 79.6936 }
  },
  {
    name: 'Simhachalam Temple',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://media.tripinvites.com/places/visakhapatnam/simhachalam-temple/the-simhachalam-temple-featured.jpg',
    description: 'Hill shrine, serene views.',
    coords: { lat: 17.7669, lng: 83.2506 }
  },
  {
    name: 'Lepakshi Veerabhadra Temple',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://www.templepurohit.com/wp-content/uploads/2015/08/Lepakshi-Temple.jpg',
    description: 'Murals and hanging pillar.',
    coords: { lat: 13.8006, lng: 77.6050 }
  },
  {
    name: 'Yadadri Temple',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://tse2.mm.bing.net/th/id/OIP.2whmNXvGTGhi5rUFcgeWNQHaEK?pid=Api&P=0&h=220',
    description: 'Grand shrine on hilltop.',
    coords: { lat: 17.5866, lng: 78.9433 }
  },
  {
    name: 'Guruvayur Temple',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://tse4.mm.bing.net/th/id/OIP.3BqTD9ZWWyxjPXPsM0Xz8QHaEH?pid=Api&P=0&h=220',
    description: 'Kerala’s famed Krishna temple.',
    coords: { lat: 10.5943, lng: 76.0413 }
  },
  {
    name: 'Tiruchendur Murugan Temple',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://kandhan.org/wp-content/uploads/2024/01/Tiruchendur_koil.jpeg',
    description: 'Seaside shrine of Murugan.',
    coords: { lat: 8.4971, lng: 78.1193 }
  },
  {
    name: 'Hampi',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://karnatakatourism.org/wp-content/uploads/2020/05/Hampi.jpg',
    description: 'Ruins, boulders, timeless glory.',
    coords: { lat: 15.3350, lng: 76.4600 }
  },
  {
    name: 'Charminar',
    location: 'Hyderabad, Telangana',
    duration: '2D / 1N',
    image: 'https://wallpaperaccess.com/full/4495586.jpg',
    description: 'Iconic arches and bazaars.',
    coords: { lat: 17.3616, lng: 78.4747 }
  },
  {
    name: 'Mysore Palace',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://wallpaperaccess.com/full/5515777.jpg',
    description: 'Royal grandeur and lights.',
    coords: { lat: 12.3052, lng: 76.6552 }
  },
  {
    name: 'Murudeshwar',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://www.holidify.com/images/bgImages/MURUDESHWAR.jpg',
    description: 'Giant Shiva by sea.',
    coords: { lat: 14.0943, lng: 74.4845 }
  },
  {
    name: 'Ooty',
    location: 'Tamil Nadu',
    duration: '3D / 2N',
    image: 'https://res.cloudinary.com/voyehomes/image/upload/v1657619197/Blogs/ooty/rose_lcgkdk.jpg',
    description: 'Cool climate, scenic charm.',
    coords: { lat: 11.4102, lng: 76.6950 }
  },
  {
    name: 'Kodaikanal',
    location: 'Tamil Nadu',
    duration: '3D / 2N',
    image: 'https://1.bp.blogspot.com/-LMFUp83_LHk/T9b3uHBwB8I/AAAAAAAABZQ/5c1Nqo4Ix1E/s1600/Kodaikanal_Tourism+01.jpg',
    description: 'Lake views, pine trails.',
    coords: { lat: 10.2381, lng: 77.4892 }
  },
  {
    name: 'Munnar',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://tse4.mm.bing.net/th/id/OIP._7CACN4ODs7EPPBdb0DA_wHaEK?pid=Api&P=0&h=220',
    description: 'Tea valleys and mist.',
    coords: { lat: 10.0889, lng: 77.0595 }
  },
  {
    name: 'Alleppey Backwaters',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/cc/95/14/alleppey-backwater-tour.jpg?w=1200&h=900&s=1',
    description: 'Houseboats through calm canals.',
    coords: { lat: 9.4981, lng: 76.3388 }
  },
  {
    name: 'Wayanad',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://www.wayanad.com/files/slides/2064569462.jpg',
    description: 'Forests, falls, wild beauty.',
    coords: { lat: 11.6854, lng: 76.1320 }
  },
  {
    name: 'Coorg',
    location: 'Karnataka',
    duration: '3D / 2N',
    image: 'https://tse3.mm.bing.net/th/id/OIP.ChLtVZWDJzaz9GUXHtQhmQHaEK?pid=Api&P=0&h=220',
    description: 'Coffee estates and hills.',
    coords: { lat: 12.4244, lng: 75.7382 }
  },
  {
    name: 'Kanyakumari',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse3.mm.bing.net/th/id/OIP.bybdbFLeV3aFNuyt7pkcOAHaEK?pid=Api&P=0&h=220',
    description: 'Sunrise, sunset, ocean confluence.',
    coords: { lat: 8.0883, lng: 77.5385 }
  },
  {
    name: 'Kochi',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/de/f0/eb/backwater-tourism.jpg?w=700&h=-1&s=1',
    description: 'Harbor charm, heritage lanes.',
    coords: { lat: 9.9312, lng: 76.2673 }
  },
  {
    name: 'Thekkady',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://www.soil2soulexpeditions.com/admin/public/images/cities/image_file/48334/Thekkady.jpg',
    description: 'Wildlife safaris, spice trails.',
    coords: { lat: 9.6031, lng: 77.1615 }
  },
  {
    name: 'Bhuvanagiri Fort',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://media.assettype.com/outlooktraveller%2F2024-08-17%2Fny2v7uto%2F2020031977.jpg?w=640&auto=format%2Ccompress',
    description: 'Monolith fort, panoramic views.',
    coords: { lat: 17.5151, lng: 78.8850 }
  },
  {
    name: 'Warangal',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://tourism.telangana.gov.in/storage/app/media/WARANGAL-IMAGE.jpg',
    description: 'Kakatiya heritage, stone gateways.',
    coords: { lat: 17.9689, lng: 79.5941 }
  },
  {
    name: 'Araku Valley',
    location: 'Andhra Pradesh',
    duration: '3D / 2N',
    image: 'https://luxoticholidays.com/blog/wp-content/uploads/2025/02/visakhapatnam-araku-valley.jpg',
    description: 'Coffee hills, misty valleys.',
    coords: { lat: 18.3270, lng: 82.8795 }
  },
  {
    name: 'Pulicat Lake',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://hblimg.mmtcdn.com/content/hubble/img/ttd_images/mmt/activities/m_Nellore_Pulicat_lake-1_l_427_640.jpg',
    description: 'Birdlife, lagoons, serene sunsets.',
    coords: { lat: 13.4269, lng: 80.3189 }
  },
  {
    name: 'Udupi',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://karnatakatourism.org/_next/image/?url=https%3A%2F%2Fweb-cms.karnatakatourism.org%2Fwp-content%2Fuploads%2F2025%2F06%2Fdji_0053.webp&w=3840&q=75',
    description: 'Temples, beaches, coastal flavors.',
    coords: { lat: 13.3409, lng: 74.7421 }
  }
];

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './destinations.html',
  styleUrl: './destinations.css'
})
export class Destinations implements OnInit {
  destinations: Destination[] = [...FALLBACK_DESTINATIONS];
  searchTerm = '';
  sortBy: 'recommended' | 'price' | 'distance' | 'rating' | 'time' | 'state' = 'recommended';
  selectedCategory = 'all';
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

  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.destinations = [...FALLBACK_DESTINATIONS];
    const raw = this.route.snapshot.queryParamMap.get('category') ?? 'all';
    this.selectedCategory = this.normalizeCategory(raw);
  }

  onImageError(event: Event, placeName: string): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) {
      return;
    }

    if (img.src !== this.fallbackImage) {
      img.src = this.fallbackImage;
    }
  }

  get visibleDestinations(): Destination[] {
    const term = this.searchTerm.trim().toLowerCase();
    let items = [...this.destinations];

    if (term) {
      items = items.filter((d) => {
        const state = this.getState(d).toLowerCase();
        return (
          d.name.toLowerCase().includes(term) ||
          d.location.toLowerCase().includes(term) ||
          state.includes(term)
        );
      });
    }

    if (this.selectedCategory !== 'all') {
      items = items.filter((d) => this.getCategory(d) === this.selectedCategory);
    }

    switch (this.sortBy) {
      case 'price':
        items.sort((a, b) => this.getPrice(a) - this.getPrice(b));
        break;
      case 'distance':
        if (this.userCoords) {
          items.sort((a, b) => this.getDistanceKm(a) - this.getDistanceKm(b));
        }
        break;
      case 'rating':
        items.sort((a, b) => this.getRating(b) - this.getRating(a));
        break;
      case 'time':
        items.sort((a, b) => this.getDays(a) - this.getDays(b));
        break;
      case 'state':
        items.sort((a, b) => this.getState(a).localeCompare(this.getState(b)));
        break;
      default:
        items.sort((a, b) => this.hashName(a.name) - this.hashName(b.name));
        break;
    }

    return items;
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
    if (key.includes('temple') || key.includes('tirupati') || key.includes('guruvayur')) {
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
      key.includes('kodaikanal') ||
      key.includes('munnar') ||
      key.includes('coorg')
    ) {
      return 'hill-stations';
    }
    return 'heritage';
  }

  get activeSortLabel(): string {
    const labels: Record<typeof this.sortBy, string> = {
      recommended: 'Recommended',
      price: 'Price',
      distance: 'Distance',
      rating: 'Ratings',
      time: 'Time',
      state: 'State'
    };
    return labels[this.sortBy];
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'recommended';
    this.selectedCategory = 'all';
    this.selectedCity = '';
    this.userCoords = null;
    this.distanceSource = '';
    this.locationStatus = 'Select a city to sort by nearest distance.';
  }

  private normalizeCategory(value: string): string {
    const key = value.trim().toLowerCase();
    const allowed = ['all', 'temples', 'backwaters', 'forests', 'hill-stations', 'heritage'];
    return allowed.includes(key) ? key : 'all';
  }

  private hashName(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
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
    this.locationStatus = `Showing distance from ${city.name} (approx. straight-line).`;
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
        this.locationStatus = 'Showing distance from your location (approx. straight-line).';
        this.resolvingLocation = false;
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
    const key = value.trim().toLowerCase();
    return this.cityOptions.find((c) => c.name.toLowerCase() === key);
  }

  trackByDestination(index: number, place: Destination): string {
    return place.name;
  }
}
