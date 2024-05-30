import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchGuidedComponent } from './search-guided.component';

describe('SearchGuidedComponent', () => {
  let component: SearchGuidedComponent;
  let fixture: ComponentFixture<SearchGuidedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchGuidedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchGuidedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
