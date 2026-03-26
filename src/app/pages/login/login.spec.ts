import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Login } from './login';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  const mockAuthService: Partial<AuthService> = {
    isAuthenticated$: of(false)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
