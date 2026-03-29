import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  async uploadActivityImage(file: File): Promise<string> {
    const { getDownloadURL, getStorage, ref, uploadBytes } = await import('firebase/storage');
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    const storage = getStorage(app);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const filePath = `activities/${Date.now()}-${sanitizedName}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }
}
