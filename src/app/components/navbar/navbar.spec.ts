import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  const mockAuthService = {
    user$: of(null),
    currentUser: null,
    logout: async () => undefined
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: mockAuthService as unknown as AuthService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
