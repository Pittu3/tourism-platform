import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let currentUser: unknown | null;
  let mockAuthService: {
    login: ReturnType<typeof vi.fn>;
    signup: ReturnType<typeof vi.fn>;
    googleLogin: ReturnType<typeof vi.fn>;
    requiresEmailVerification: ReturnType<typeof vi.fn>;
    whenReady: ReturnType<typeof vi.fn>;
    readonly currentUser: unknown | null;
  };
  let router: Router;
  let navigateByUrlSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    currentUser = null;
    mockAuthService = {
      login: vi.fn(),
      signup: vi.fn(),
      googleLogin: vi.fn(),
      requiresEmailVerification: vi.fn().mockReturnValue(false),
      whenReady: vi.fn().mockResolvedValue(undefined),
      get currentUser() {
        return currentUser;
      }
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService as unknown as AuthService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
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

    await component.onLoginSubmit(invalidForm);

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please correct the highlighted fields and try again.');
  });

  it('shows the auth error when login fails', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Incorrect email or password.'));
    const validForm = { invalid: false } as never;
    component.loginEmail = 'demo@example.com';
    component.loginPassword = 'secret123';

    await component.onLoginSubmit(validForm);

    expect(component.errorMessage).toBe('Incorrect email or password.');
    expect(component.loading).toBe(false);
  });

  it('redirects to home after a successful login', async () => {
    mockAuthService.login.mockResolvedValue({
      uid: 'u1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: '',
      emailVerified: true,
      providerIds: ['password']
    });
    const validForm = { invalid: false } as never;
    component.loginEmail = 'demo@example.com';
    component.loginPassword = 'secret123';

    const loginPromise = component.onLoginSubmit(validForm);
    await vi.advanceTimersByTimeAsync(750);
    await loginPromise;

    expect(component.successMessage).toContain('Welcome back, Demo User');
    expect(component.loginPassword).toBe('');
    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/home');
  });

  it('redirects to home after a successful Google sign-in', async () => {
    mockAuthService.googleLogin.mockResolvedValue({
      uid: 'u3',
      email: 'googleuser@example.com',
      displayName: 'Google User',
      photoURL: '',
      emailVerified: true,
      providerIds: ['google.com']
    });

    const googlePromise = component.signInWithGoogle();
    await vi.advanceTimersByTimeAsync(750);
    await googlePromise;

    expect(component.successMessage).toContain('Signed in as Google User');
    expect(component.isAuthenticated).toBe(true);
    expect(component.googleLoading).toBe(false);
    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/home');
  });

  it('shows the auth error when Google sign-in fails', async () => {
    mockAuthService.googleLogin.mockRejectedValue(
      new Error('Google sign-in popup was closed before completion.')
    );

    await component.signInWithGoogle();

    expect(component.errorMessage).toBe('Google sign-in popup was closed before completion.');
    expect(component.googleLoading).toBe(false);
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('shows an error when register passwords do not match', async () => {
    const validForm = { invalid: false } as never;
    component.authMode = 'register';
    component.registerName = 'Demo User';
    component.registerEmail = 'demo@example.com';
    component.registerPassword = 'secret123';
    component.confirmPassword = 'different123';

    await component.onRegisterSubmit(validForm);

    expect(mockAuthService.signup).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Passwords do not match.');
    expect(component.loading).toBe(false);
  });

  it('keeps user on login mode with verification guidance after email signup', async () => {
    mockAuthService.requiresEmailVerification.mockReturnValue(true);
    mockAuthService.signup.mockResolvedValue({
      uid: 'u2',
      email: 'newuser@example.com',
      displayName: 'New User',
      photoURL: '',
      emailVerified: false,
      providerIds: ['password']
    });
    const validForm = { invalid: false } as never;
    component.authMode = 'register';
    component.registerName = 'New User';
    component.registerEmail = 'newuser@example.com';
    component.registerPassword = 'secret123';
    component.confirmPassword = 'secret123';

    await component.onRegisterSubmit(validForm);

    expect(component.authMode).toBe('login');
    expect(component.isAuthenticated).toBe(false);
    expect(component.successMessage).toContain('Please verify your email before logging in');
    expect(component.loginEmail).toBe('newuser@example.com');
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });
});
