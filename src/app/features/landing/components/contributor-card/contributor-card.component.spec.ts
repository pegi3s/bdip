import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorCardComponent } from './contributor-card.component';

describe('ContributorCardComponent', () => {
  let component: ContributorCardComponent;
  let fixture: ComponentFixture<ContributorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributorCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContributorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
