import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  {
    path: 'destinations',
    loadComponent: () => import('./pages/destinations/destinations').then((m) => m.Destinations)
  },
  {
    path: 'destinations/:id',
    loadComponent: () =>
      import('./pages/destination-detail/destination-detail').then((m) => m.DestinationDetail)
  },
  {
    path: 'activities',
    loadComponent: () => import('./pages/activities/activities').then((m) => m.Activities)
  },
  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking').then((m) => m.Booking),
    canActivate: [authGuard]
  },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings').then((m) => m.MyBookings),
    canActivate: [authGuard]
  },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
