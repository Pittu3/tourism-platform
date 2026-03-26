# Tourism Platform - User Guide

## 1. Start Here
1. Open the app in your browser.
2. Use the top navigation to move between Home, Destinations, Activities, Booking, Login, and Contact.
3. Use Home as an entry point, then continue to destinations or direct booking.

## 2. Home Page
- View travel highlights and quick links.
- Navigate to destination categories.
- Use primary CTAs to start exploration or booking.

## 3. Destinations Page
### Search
Use the search bar to match:
- Destination names
- State/location text
- Category labels
- Description keywords

### Filters
- Category: Temples, Backwaters, Forests, Hill Stations, Heritage & Cities
- Popularity: All, Must Visit, Trending Now, Hidden Gems
- City-based distance context: choose a city or use browser location

### Sorting
- Distance, price, rating, duration, alphabetical
- Multiple sorts can be applied and reordered by selection

### Card Actions
- Click image/title -> opens destination detail page
- Click Book Now -> opens booking workflow

## 4. Destination Detail
- Displays destination-specific details and travel context.
- If a destination link is invalid, a not-found message is shown.

## 5. Activities Page
- Filter activities by category, difficulty, and traveler type.
- Sort by recommendation, popularity, price, or duration.
- `View Destination` opens the linked destination detail page.
- `Book Activity` redirects to booking page.

## 6. Booking Page
### Flow
1. Select a destination.
2. Choose one available tour.
3. Fill travel and traveler details.
4. Accept policy consent.
5. Submit booking.

### Validation
- Destination and tour are required.
- Travel date cannot be in the past.
- Travelers must be between 1 and 12.
- Full name minimum length: 3.
- Valid email required.
- Phone must match Indian mobile format (`^[6-9][0-9]{9}$`).
- Consent is mandatory.

### Success Output
- Booking ID
- Tour details
- Travelers and date
- Total payable amount

## 7. Login Page (Demo)
### Available Demo Credentials
- `user@example.com` / `password`
- `planner@example.com` / `travel2026`

### Behavior
- Inline email/password validation
- Remember-me stores email for future sessions
- Active session redirects user to Home
- Demo-account quick buttons autofill credentials

## 8. Contact Page
### Flow
1. Fill name, email, phone, inquiry type, subject, and message.
2. Accept consent.
3. Submit inquiry.

### Validation
- Required fields with min/max limits
- Email format check
- Indian phone format check
- HTML tags blocked in text fields
- Spam-like keywords rejected in service layer

### Success Output
- Ticket ID
- Confirmation message
- Estimated reply timeline

## 9. Troubleshooting
- No tours shown: reselect destination.
- Form not submitting: check inline validation errors.
- Empty destination results: click `Reset Filters`.
- Login failing: use one of the demo account pairs exactly as shown.
