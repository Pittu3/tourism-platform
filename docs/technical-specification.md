# Tourism Platform - Technical Specification

## 1. Scope
This document defines frontend module boundaries, service contracts, routing rules, data structures, and validation behavior for the Tourism Platform Angular standalone SPA with Firebase Authentication and Firestore persistence.

## 2. Service Contracts

## 2.1 Auth Service
File: `src/app/services/auth.service.ts`

Exports:
- `AppUser`

Public API:
- `user$: Observable<AppUser | null>`
- `loading$: Observable<boolean>`
- `isAuthenticated$: Observable<boolean>`
- `currentUser: AppUser | null` (getter)
- `whenReady(): Promise<void>`
- `login(email: string, password: string): Promise<AppUser>`
- `signup(displayName: string, email: string, password: string): Promise<AppUser>`
- `googleLogin(): Promise<AppUser>`
- `logout(): Promise<void>`
- `isLoggedIn(): boolean`
- `getCurrentUserId(): string | null`
- `requiresEmailVerification(user?: AppUser | null): boolean`
- `canAccessProtectedRoutes(user?: AppUser | null): boolean`

Behavior notes:
- Uses Firebase Authentication (email/password + Google popup sign-in).
- Persists session with browser local persistence.
- Upserts authenticated user metadata in Firestore `users` collection.
- For password accounts, can require verified email before granting access.

## 2.2 Booking Service
File: `src/app/services/booking.service.ts`

Exports:
- `DestinationOption`
- `TourOption`
- `BookingRequest`
- `BookingConfirmation`

Methods:
- `getDestinationOptions(): DestinationOption[]`
- `getToursForDestination(destinationName: string): Observable<TourOption[]>`
- `submitBooking(request: BookingRequest): Observable<BookingConfirmation>`

Validation behavior:
- Returns no tours for an invalid destination in `getToursForDestination`.
- Rejects invalid destination in `submitBooking`.
- Rejects unavailable or invalid tour selection.
- Rejects traveler counts above available seats.

## 2.3 Contact Service
File: `src/app/services/contact.service.ts`

Exports:
- `ContactRequest`
- `ContactResponse`

Methods:
- `submitInquiry(request: ContactRequest): Observable<ContactResponse>`

Validation behavior:
- Rejects messages with blocked keywords (`http://`, `https://`, `free money`, `lottery`).
- Generates ticket ID and estimated response hours by inquiry type.

## 2.4 Firestore Service
File: `src/app/services/firestore.service.ts`

Exports:
- `Activity`
- `AddActivityPayload`
- `Booking`
- `CreateBookingPayload`

Methods:
- `addActivity(payload: AddActivityPayload, imageFile?: File): Promise<string>`
- `getActivities(): Observable<Activity[]>`
- `createBooking(payload: CreateBookingPayload): Promise<string>`
- `getUserBookings(userId: string): Observable<Booking[]>`

Behavior notes:
- Writes activity and booking records to Firestore collections.
- Provides user-specific booking query stream for dashboard/my-bookings views.

## 3. Page Module Specifications

## 3.1 Destinations Page
File: `src/app/pages/destinations/destinations.ts`

Capabilities:
- Search across destination name, location, state, category label, and description.
- Filters: multi-select category and popularity.
- City/geolocation context for distance-aware sort and pricing.
- Sorting: recommended, price, distance, rating, duration, alphabetical.
- Pagination and track-by using numeric destination ID.
- Description hydration from `/assets/destination-descriptions.json`.

## 3.2 Destination Detail Page
File: `src/app/pages/destination-detail/destination-detail.ts`

Capabilities:
- Loads destination via numeric route parameter `id`.
- Finds destination by `Destination.id`.
- Handles not-found and image fallback paths.
- Hydrates description from `/assets/destination-descriptions.json`.

## 3.3 Activities Page
File: `src/app/pages/activities/activities.ts`

Capabilities:
- Loads Firestore activities and merges local fallback activities.
- Filters by category and text search.
- Sorting by popularity, title, or category.
- Client-side favorites state and activity detail modal.
- Pagination and track-by using activity ID.

## 3.4 Booking Page
File: `src/app/pages/booking/booking.ts`

Capabilities:
- Reactive form workflow for booking.
- Dynamic tour retrieval by selected destination.
- Submission via `BookingService` mock confirmation.
- Persists booking summary to Firestore for authenticated users.

## 3.5 Contact Page
File: `src/app/pages/contact/contact.ts`

Capabilities:
- Reactive support form.
- HTML tag blocking validator.
- Service-driven ticket response.

## 3.6 Login/Register Page
File: `src/app/pages/login/login.ts`

Capabilities:
- Template-driven login and register flows.
- Email/password auth plus Google sign-in.
- Client-side password confirmation checks for registration.
- Success/error toast messaging and redirect handling via `redirectTo` query param.

## 3.7 Dashboard Page
File: `src/app/pages/dashboard/dashboard.ts`

Capabilities:
- Authenticated user summary.
- Live booking stream for current user.
- Logout flow with redirect and feedback.

## 3.8 My Bookings Page
File: `src/app/pages/my-bookings/my-bookings.ts`

Capabilities:
- Fetches current user bookings from Firestore.
- Sorts by creation timestamp descending.
- Formats travel and creation dates for display.

## 4. Data Structures

## 4.1 Destination
File: `src/app/data/destinations-data.ts`

`Destination` fields:
- `id: number`
- `name: string`
- `location: string`
- `duration: string`
- `image: string`
- `description: string`
- `coords: { lat: number; lng: number }`

Notes:
- `FALLBACK_DESTINATIONS` IDs are generated sequentially (`index + 1`) from `destinationSeeds`.

## 5. Routing Specification
File: `src/app/app.routes.ts`

Routes:
- `''` -> Home
- `'home'` -> Home
- `'destinations'` -> Destinations
- `'destinations/:id'` -> DestinationDetail
- `'activities'` -> Activities
- `'booking'` -> Booking (`authGuard`)
- `'login'` -> Login
- `'register'` -> Login (register mode)
- `'signup'` -> Redirect to `'register'`
- `'dashboard'` -> Dashboard (`authGuard`)
- `'my-bookings'` -> MyBookings (`authGuard`)
- `'contact'` -> Contact
- `'**'` -> Redirect to `''`

## 6. Validation Rules

## 6.1 Booking Form
- `destinationName`: required
- `tourId`: required
- `travelDate`: required, not in past
- `travelers`: required, min 1, max 12
- `fullName`: required, min length 3
- `email`: required, email format
- `phone`: required, regex `^[6-9][0-9]{9}$`
- `specialRequests`: max length 250
- `agreeToPolicy`: required true

## 6.2 Contact Form
- `fullName`: required, min length 3, no HTML tags
- `email`: required, email format
- `phone`: required, regex `^[6-9][0-9]{9}$`
- `inquiryType`: required
- `subject`: required, min 6, max 80
- `message`: required, min 20, max 600, no HTML tags
- `consent`: required true

## 6.3 Auth Forms
- Login email: required, email format
- Login password: required, min length 6
- Register full name: required, min length 2
- Register email: required, email format
- Register password: required, min length 6
- Confirm password: required, min length 6, must match register password

## 7. Security and Compliance Notes
Implemented frontend controls:
- Pattern and length-based validators.
- HTML tag rejection and spam-keyword checks in contact flow.
- Firebase Authentication session handling.
- Route protection for booking/dashboard/my-bookings via `authGuard`.
- No direct unsafe HTML rendering in core pages.

Known limitations:
- Guard currently checks authenticated session presence; it does not enforce user roles.
- Most business validation remains client-side.
- No dedicated backend threat controls documented in this frontend scope (rate limiting, CSRF policy).

## 8. Build and Test Commands
- Build: `npm run build`
- Unit tests (Windows): `npm.cmd run test -- --watch=false`
- Unit tests (cross-platform): `npm run test -- --watch=false`

## 9. Current Verification Snapshot
- Snapshot date: April 4, 2026
- Build: PASS (`npm run build`)
- Unit tests: PASS (`npm.cmd run test -- --watch=false`)
- Test summary: 13 files, 24 tests passed
- Known warning: initial bundle budget exceeded by 149.20 kB (budget 500.00 kB, total 649.20 kB)
