import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  {
    path: 'destinations',
    loadComponent: () => import('./pages/destinations/destinations').then((m) => m.Destinations)
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
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings').then((m) => m.MyBookings),
    canActivate: [authGuard]
  },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
