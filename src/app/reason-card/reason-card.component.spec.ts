import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonCardComponent } from './reason-card.component';

describe('ReasonCardComponent', () => {
  let component: ReasonCardComponent;
  let fixture: ComponentFixture<ReasonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasonCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReasonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
