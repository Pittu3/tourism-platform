# Tourism Platform - System Architecture

## 1. Overview
Tourism Platform is a client-side Angular 21 SPA built with standalone components. The system delivers destination discovery, activity exploration, booking requests, contact support, and demo authentication.

Architecture style:
- Component-driven UI with page-level standalone components
- Service-oriented business logic for mock API behavior
- Static fallback data + optional JSON hydration
- Router-driven navigation between feature modules

## 2. Technology Stack
- Framework: Angular 21
- Language: TypeScript 5.9
- Styling: Component-scoped CSS
- Async/data patterns: RxJS Observables
- Build tooling: Angular CLI (`@angular/build`)
- Unit testing: Vitest (`ng test`)

## 3. High-Level Structure
```text
src/app
  app.ts
  app.routes.ts
  app.config.ts
  pages/
    home/
    destinations/
    destination-detail/
    activities/
    booking/
    contact/
    login/
  components/
    navbar/, footer/, hero/, highlights/, testimonials/, ...
  services/
    booking.service.ts
    contact.service.ts
    auth.service.ts
  data/
    destinations-data.ts
src/assets/
  destination-descriptions.json
```

## 4. Routing Model
Defined in `src/app/app.routes.ts`.

Routes:
- `/` and `/home` -> Home
- `/destinations` -> Destination listing
- `/destinations/:id` -> Destination detail (ID-based endpoint)
- `/activities` -> Activities
- `/booking` -> Booking workflow
- `/login` -> Demo login
- `/contact` -> Contact form
- `**` -> Redirect to `/`

## 5. Data Model and Source Strategy
### Destination Data
Source: `src/app/data/destinations-data.ts`

- `Destination` includes:
  - `id`, `name`, `location`, `duration`, `image`, `description`, `coords`
- Seed data is stored once, then transformed into `FALLBACK_DESTINATIONS` with deterministic IDs.
- Description content can be hydrated from `src/assets/destination-descriptions.json`.

### Derived Destination IDs
- Each destination ID is generated deterministically from `name + location`.
- This avoids exposing destination names in route paths and keeps links stable across sessions.

## 6. Feature Modules
### 6.1 Destinations
- Rich listing cards with metadata, snippets, and CTA.
- Search over name/state/location/category/description.
- Category + popularity + location-based filtering.
- Multi-sort and pagination.

### 6.2 Destination Detail
- Loads destination by route `id`.
- Displays rich hero/detail layout and travel context.
- Handles not-found and image fallback scenarios.

### 6.3 Activities
- Curated activities with category, difficulty, traveler-type filters.
- Sort options and destination deep-link routing.
- Uses destination ID lookup for detail navigation consistency.

### 6.4 Booking
- Destination -> available tours -> traveler details flow.
- Reactive form with validation (date, travelers, contact data, consent).
- Mock booking confirmation with booking ID and calculated amount.

### 6.5 Contact
- Reactive support form with validation.
- HTML-tag blocking and spam-keyword checks.
- Mock ticket response with estimated reply hours.

### 6.6 Login (Demo)
- Template-driven login form with inline validation.
- `AuthService` mock authentication with two demo accounts.
- Remember-me email persistence and session storage behavior.

## 7. Service Layer
- `BookingService`: destination options, generated tours, booking confirmation flow.
- `ContactService`: ticket generation and basic anti-spam guardrails.
- `AuthService`: mock login, session persistence, remembered email retrieval, demo account exposure.

## 8. Security Posture (Current Frontend Scope)
Implemented:
- Form-level input validation and pattern checks.
- Contact text sanitization guard (HTML tags blocked).
- Spam keyword filtering in contact service mock.
- No raw `innerHTML` injection patterns in primary pages.

Limitations (expected for frontend-only demo):
- No backend auth/session enforcement.
- No server-side validation or rate limiting.
- No CSRF protections (requires backend).

## 9. Non-Functional Characteristics
- Responsive layouts for desktop/tablet/mobile.
- Deterministic mock responses for repeatable demos.
- Build and unit-test friendly architecture.

## 10. Build and Test Status
- Build command: `npm run build` -> PASS
- Test command: `npm.cmd run test -- --watch=false` -> PASS
- Known non-blocking warning: `destinations.css` style budget exceeds configured warning threshold.
