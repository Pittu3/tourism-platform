# TourismPlatform

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Firebase setup

Firebase has been scaffolded for the login flow using the official Firebase Web SDK.

1. Open `src/environments/environment.ts`.
2. Replace the placeholder `firebase` values with your Firebase project settings.
3. In the Firebase console, enable `Authentication > Sign-in method > Email/Password`.
4. If you want Google sign-in, also enable `Authentication > Sign-in method > Google`.
5. Add your local dev origin to `Authentication > Settings > Authorized domains` when needed.
6. Create a test user in Firebase Authentication if you are testing email/password.
7. Run `npm start` and sign in from the `/login` page.

The project is also ready for Firestore through `src/app/core/firebase/firebase.ts` if you want to save bookings next.

## Firestore bookings

The `/booking` page now writes booking submissions to the `bookings` collection in Firestore.
The `/my-bookings` page reads the signed-in user's bookings back from Firestore.

To use it:

1. Create Firestore Database in the Firebase console.
2. Publish the Firestore rules from `firestore.rules`.
3. Submit the booking form from a signed-in account and confirm documents appear in the `bookings` collection.

### Firestore rules deployment

This repository now includes:

- `firestore.rules`
- `firebase.json`

To deploy the rules with the Firebase CLI:

```bash
firebase login
firebase use tourism-platform-5570a
firebase deploy --only firestore:rules
```

The provided rules allow:

- authenticated users to create bookings only for their own email and UID
- authenticated users to read only their own bookings
- no updates or deletes from the client

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
