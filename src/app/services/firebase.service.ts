import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  readonly auth = inject(Auth);
  readonly firestore = inject(Firestore);
  readonly storage = inject(Storage);

  readonly user$: Observable<User | null> = authState(this.auth);

  async uploadActivityImage(file: File): Promise<string> {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const filePath = `activities/${Date.now()}-${sanitizedName}`;
    const fileRef = ref(this.storage, filePath);

    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }
}
