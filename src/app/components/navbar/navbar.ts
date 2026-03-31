import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  menuOpen = false;
  readonly user = toSignal(this.authService.user$, { initialValue: this.authService.currentUser });
  readonly userLabel = computed(() => {
    const activeUser = this.user();
    if (!activeUser) {
      return '';
    }

    const preferredName = activeUser.displayName?.trim();
    if (preferredName) {
      return preferredName;
    }

    return activeUser.email || 'Signed in';
  });

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  getUserInitial(): string {
    const label = this.userLabel().trim();
    if (!label) {
      return 'U';
    }

    return label.charAt(0).toUpperCase();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.menuOpen = false;
    await this.router.navigate(['/login'], {
      queryParams: { loggedOut: '1' }
    });
  }
}
