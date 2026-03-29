import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let mockAuthService: {
    login: ReturnType<typeof vi.fn>;
    googleLogin: ReturnType<typeof vi.fn>;
    isAuthenticated$: BehaviorSubject<boolean>;
  };
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      login: vi.fn(),
      googleLogin: vi.fn(),
      isAuthenticated$: isAuthenticatedSubject
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService as unknown as AuthService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a validation message and skips login when the form is invalid', async () => {
    const invalidForm = { invalid: true } as never;

    await component.onSubmit(invalidForm);

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please correct the highlighted fields and try again.');
  });

  it('shows the auth error when login fails', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Incorrect email or password.'));
    const validForm = { invalid: false } as never;
    component.email = 'demo@example.com';
    component.password = 'secret123';

    await component.onSubmit(validForm);

    expect(component.errorMessage).toBe('Incorrect email or password.');
    expect(component.loading).toBe(false);
  });

  it('redirects to dashboard after a successful login', async () => {
    mockAuthService.login.mockResolvedValue({
      uid: 'u1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: ''
    });
    const validForm = { invalid: false } as never;
    component.email = 'demo@example.com';
    component.password = 'secret123';

    await component.onSubmit(validForm);

    expect(component.successMessage).toContain('Welcome back, Demo User');
    expect(component.password).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(700);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('does not schedule duplicate redirects when auth state updates after login', async () => {
    mockAuthService.login.mockResolvedValue({
      uid: 'u1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: ''
    });
    const validForm = { invalid: false } as never;

    await component.onSubmit(validForm);
    isAuthenticatedSubject.next(true);
    await vi.advanceTimersByTimeAsync(700);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
