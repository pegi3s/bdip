import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorListComponent } from './contributor-list.component';

describe('ContributorListComponent', () => {
  let component: ContributorListComponent;
  let fixture: ComponentFixture<ContributorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributorListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContributorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
