import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);

export const auth = getAuth(firebaseApp);
export const firestore = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true
});
