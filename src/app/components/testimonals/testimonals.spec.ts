import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Testimonals } from './testimonals';

describe('Testimonals Component', () => {
  let component: Testimonals;
  let fixture: ComponentFixture<Testimonals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testimonals] // ✅ standalone components go here
    }).compileComponents();

    fixture = TestBed.createComponent(Testimonals);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ✅ triggers Angular change detection
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});