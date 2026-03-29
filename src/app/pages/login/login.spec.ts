import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Login } from './login';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let mockAuthService: jasmine.SpyObj<AuthService> & { isAuthenticated$: BehaviorSubject<boolean> };
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'googleLogin'], {
      isAuthenticated$: isAuthenticatedSubject
    }) as jasmine.SpyObj<AuthService> & { isAuthenticated$: BehaviorSubject<boolean> };
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    mockAuthService.login.and.rejectWith(new Error('Incorrect email or password.'));
    const validForm = { invalid: false } as never;
    component.email = 'demo@example.com';
    component.password = 'secret123';

    await component.onSubmit(validForm);

    expect(component.errorMessage).toBe('Incorrect email or password.');
    expect(component.loading).toBeFalse();
  });

  it('redirects to dashboard after a successful login', fakeAsync(() => {
    mockAuthService.login.and.resolveTo({
      uid: 'u1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: ''
    });
    const validForm = { invalid: false } as never;
    component.email = 'demo@example.com';
    component.password = 'secret123';

    void component.onSubmit(validForm);
    flushMicrotasks();

    expect(component.successMessage).toContain('Welcome back, Demo User');
    expect(component.password).toBe('');
    expect(routerSpy.navigate).not.toHaveBeenCalled();

    tick(700);

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
  }));

  it('does not schedule duplicate redirects when auth state updates after login', fakeAsync(() => {
    mockAuthService.login.and.resolveTo({
      uid: 'u1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: ''
    });
    const validForm = { invalid: false } as never;

    void component.onSubmit(validForm);
    flushMicrotasks();
    isAuthenticatedSubject.next(true);
    tick(700);

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));
});
