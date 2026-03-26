# Tourism Platform

Tourism Platform is an Angular standalone-component SPA for discovering destinations, exploring activities, booking tours, sending support inquiries, and using a mock login flow.

## Milestone Coverage
- Week 3-4: Destinations page with detailed listings, category/popularity filters, search, and sorting.
- Week 5-6: Booking page with destination-tour workflow, form validation, and booking service mock submission.
- Week 7-8: Contact Us page, full-system review updates, bug fixes, and documentation pack.

## Core Features
- Destination listing with search, pagination, multi-filter, popularity labels, and fallback image handling.
- Destination detail pages routed by dedicated destination IDs (`/destinations/:id`).
- Activities catalog with filters and deep links to destination detail pages.
- Booking flow with dynamic tours and validation-rich form submission.
- Contact flow with anti-spam checks and ticket-based mock response.
- Demo login with remember-me support and session persistence via web storage.

## Tech Stack
- Angular 21 (standalone components)
- TypeScript 5.9
- RxJS Observables for async mock flows
- Component-scoped CSS
- Vitest (`ng test`)

## Getting Started
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm start
```
3. Open:
```text
http://localhost:4200
```

## Scripts
- `npm start` - start local dev server
- `npm run build` - production build to `dist/tourism-platform`
- `npm.cmd run test -- --watch=false` - run unit tests once

## Demo Login Accounts
- `user@example.com` / `password`
- `planner@example.com` / `travel2026`

## Main Routes
- `/` or `/home` - Home
- `/destinations` - Destinations list
- `/destinations/:id` - Destination details
- `/activities` - Activities list
- `/booking` - Booking page
- `/login` - Login page
- `/contact` - Contact page

## Documentation Pack
Detailed documents are available in `docs/`:
- `docs/system-architecture.md`
- `docs/user-guide.md`
- `docs/technical-specification.md`
- `docs/final-testing-and-review.md`
- `docs/presentation-outline.md`

## Current Note
- Build passes successfully.
- A non-blocking Angular budget warning exists for `src/app/pages/destinations/destinations.css`.
