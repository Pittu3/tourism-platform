# Tourism Platform - Technical Specification

## 1. Scope
This document defines frontend module boundaries, service contracts, routing rules, data structures, and validation behavior for the Tourism Platform Angular SPA.

## 2. Service Contracts

## 2.1 Auth Service
File: `src/app/services/auth.service.ts`

Exports:
- `AuthUser`
- `AuthSession`
- `DemoAccount`

Methods:
- `login(email: string, password: string, rememberMe: boolean): Observable<AuthSession>`
- `logout(): void`
- `hasActiveSession(): boolean`
- `getSession(): AuthSession | null`
- `getRememberedEmail(): string`
- `getDemoAccounts(): DemoAccount[]`

Behavior notes:
- Uses mock credential records.
- Returns delayed observable to simulate API latency.
- Persists session to `localStorage` (remembered) or `sessionStorage` (temporary).
- Stores remembered email only when remember-me is enabled.

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
- Rejects invalid destination.
- Rejects unavailable/invalid tour.
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

## 3. Page Module Specifications

## 3.1 Destinations Page
File: `src/app/pages/destinations/destinations.ts`

Capabilities:
- Search across destination name, location, state, category label, and description.
- Filters: category, popularity, and location context.
- Sorting: price, distance, rating, duration, alphabetical.
- Pagination and track-by using destination ID.

## 3.2 Destination Detail Page
File: `src/app/pages/destination-detail/destination-detail.ts`

Capabilities:
- Loads destination via route parameter `id`.
- Finds destination by `Destination.id`.
- Handles not-found and image fallback paths.

## 3.3 Activities Page
File: `src/app/pages/activities/activities.ts`

Capabilities:
- Filters by category, difficulty, traveler type.
- Sorting and text search.
- Destination deep-link generation by destination ID mapping.

## 3.4 Booking Page
File: `src/app/pages/booking/booking.ts`

Capabilities:
- Reactive form workflow for booking.
- Dynamic tour retrieval by selected destination.
- Submission with mock confirmation payload.

## 3.5 Contact Page
File: `src/app/pages/contact/contact.ts`

Capabilities:
- Reactive support form.
- HTML tag blocking validator.
- Service-driven ticket response.

## 3.6 Login Page
File: `src/app/pages/login/login.ts`

Capabilities:
- Template-driven validation.
- AuthService-driven login.
- Remember-me behavior.
- Existing-session redirect and demo-account autofill.

## 4. Data Structures

## 4.1 Destination
File: `src/app/data/destinations-data.ts`

`Destination` fields:
- `id: string`
- `name: string`
- `location: string`
- `duration: string`
- `image: string`
- `description: string`
- `coords: { lat: number; lng: number }`

Notes:
- Destination IDs are generated deterministically from `name + location`.

## 5. Routing Specification
File: `src/app/app.routes.ts`

Routes:
- `''` -> Home
- `'home'` -> Home
- `'destinations'` -> Destinations
- `'destinations/:id'` -> DestinationDetail
- `'activities'` -> Activities
- `'booking'` -> Booking
- `'login'` -> Login
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

## 6.3 Login Form
- `email`: required, email format
- `password`: required, min length 6
- Optional remember-me for email persistence

## 7. Security and Compliance Notes
Implemented frontend controls:
- Pattern and length-based validators
- HTML tag rejection in contact fields
- Basic spam-keyword checks
- No direct unsafe HTML rendering in core pages

Known limitations:
- Authentication is mock/demo only
- No server-side validation or persistence enforcement
- No backend threat controls (rate limiting, CSRF handling)

## 8. Build and Test Commands
- Build: `npm run build`
- Unit tests: `npm.cmd run test -- --watch=false`

## 9. Current Verification Snapshot
- Build: PASS
- Unit tests: PASS (14 files, 15 tests)
- Known warning: `destinations.css` budget warning (non-blocking)
