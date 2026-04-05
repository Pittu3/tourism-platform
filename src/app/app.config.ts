import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

const requiredFirebaseFields = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

function initializeFirebaseAppSafe() {
  const firebaseConfig = environment.firebase;
  const missingFields = requiredFirebaseFields.filter((field) => {
    const value = firebaseConfig[field];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}. ` +
      'Update src/environments/environment.ts with valid Firebase config.'
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeFirebaseAppSafe()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
