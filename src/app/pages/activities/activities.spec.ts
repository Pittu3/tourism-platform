import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Activities } from './activities';
import { FirestoreService } from '../../services/firestore.service';

describe('Activities', () => {
  let component: Activities;
  let fixture: ComponentFixture<Activities>;

  beforeEach(async () => {
    const firestoreServiceMock = {
      getActivities: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [Activities],
      providers: [{ provide: FirestoreService, useValue: firestoreServiceMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Activities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
