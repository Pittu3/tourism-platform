import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Destinations } from './pages/destinations/destinations';
import { Activities } from './pages/activities/activities';
import { Booking } from './pages/booking/booking';
import { Contact } from './pages/contact/contact';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'destinations', component: Destinations },
  { path: 'activities', component: Activities },
  { path: 'booking', component: Booking },
  { path: 'login', component: Login },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
