import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Destinations } from './pages/destinations/destinations';
import { DestinationDetail } from './pages/destination-detail/destination-detail';
import { Activities } from './pages/activities/activities';
import { Booking } from './pages/booking/booking';
import { Contact } from './pages/contact/contact';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { MyBookings } from './pages/my-bookings/my-bookings';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'destinations', component: Destinations },
  { path: 'destinations/:id', component: DestinationDetail },
  { path: 'activities', component: Activities },
  { path: 'booking', component: Booking, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'my-bookings', component: MyBookings, canActivate: [authGuard] },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
