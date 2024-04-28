import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsLandingComponent } from './tutorials-landing.component';

describe('TutorialsLandingComponent', () => {
  let component: TutorialsLandingComponent;
  let fixture: ComponentFixture<TutorialsLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialsLandingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TutorialsLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
