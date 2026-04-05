# Tourism Platform - Presentation Outline (Week 7-8)

## Slide 1 - Title
- Tourism Platform
- Week 7-8: Contact Us, Final Testing, and Documentation
- Team, date, internship program

## Slide 2 - Problem and Goal
- Build an end-to-end tourism discovery and booking experience.
- Deliver functional milestones across Weeks 1-8.
- Validate quality and provide handoff-ready documentation.

## Slide 3 - Architecture Snapshot
- Angular standalone SPA
- Page modules + shared UI components
- Service layer (`BookingService`, `ContactService`, `AuthService`, `FirestoreService`)
- Firebase Authentication + Firestore-backed booking/activity data
- Static destination seed data + JSON description hydration

## Slide 4 - Route Map
- `/`, `/home`
- `/destinations`
- `/destinations/:id`
- `/activities`
- `/booking` (protected)
- `/login`
- `/register` (`/signup` redirect)
- `/dashboard` (protected)
- `/my-bookings` (protected)
- `/contact`

## Slide 5 - Destinations (Week 3-4)
- Detailed destination listing cards
- Search across name/location/category/description
- Category + popularity filters and sort options
- ID-based detail navigation

## Slide 6 - Activities
- Firestore activity feed with local fallback catalog
- Filters: category + text search
- Sorting by popularity/title/category
- Favorites toggle + detail modal

## Slide 7 - Booking (Week 5-6)
- Destination -> Tour -> Booking request flow
- Reactive form validations
- Mock confirmation with booking ID and total amount
- Booking summary persistence to Firestore for logged-in users

## Slide 8 - Contact Us (Week 7-8)
- Support form workflow
- Inquiry-type based response SLA
- HTML-tag and spam-keyword guardrails

## Slide 9 - Login Configuration
- Firebase authentication via `AuthService`
- Email/password login + registration + Google sign-in
- Session persistence and route-redirect support
- Success/error feedback states with logout acknowledgment

## Slide 10 - Testing Evidence
- Build command: PASS
- Unit test command: PASS
- Test totals: 13 files, 24 tests passed
- Known non-blocking warning: initial bundle budget threshold exceeded

## Slide 11 - Documentation Deliverables
- System architecture
- User guide
- Technical specification
- Final testing and review report
- Presentation outline

## Slide 12 - Risks and Next Steps
- Move from mock services to backend APIs
- Tighten guard policy for email-verification and role checks
- Reduce initial bundle size to meet budget
- Shift key validation to server-side
- Add E2E journeys and CI quality gates

## Appendix (Optional)
- Live demo script
- Data model snapshot
- Validation matrix by form
