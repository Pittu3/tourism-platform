import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  async uploadActivityImage(file: File): Promise<string> {
    if (!file) {
      throw new Error('Please select an image to upload.');
    }

    const { getDownloadURL, getStorage, ref, uploadBytes } = await import('firebase/storage');
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    const storageBucket = environment.firebase.storageBucket?.trim();
    const storage = storageBucket ? getStorage(app, `gs://${storageBucket}`) : getStorage(app);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const filePath = `activities/${Date.now()}-${sanitizedName}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Unable to upload image to Firebase Storage.';
      throw new Error(message);
    }
  }
}
