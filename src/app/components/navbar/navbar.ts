import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  private readonly sessionService = inject(SessionService);

  menuOpen = false;
  readonly user = toSignal(this.sessionService.user$, { initialValue: this.sessionService.currentUser });

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  async logout(): Promise<void> {
    const [{ auth }, { signOut }] = await Promise.all([
      import('../../core/firebase/firebase'),
      import('firebase/auth')
    ]);

    await signOut(auth);
    this.sessionService.clearUser();
    this.menuOpen = false;
  }
}
