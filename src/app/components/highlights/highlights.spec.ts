import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Highlights } from './highlights';
import { RouterModule } from '@angular/router';

describe('Highlights', () => {
  let component: Highlights;
  let fixture: ComponentFixture<Highlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Highlights, RouterModule.forRoot([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Highlights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
