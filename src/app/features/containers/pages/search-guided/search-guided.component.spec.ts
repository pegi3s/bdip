import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SearchGuidedComponent } from './search-guided.component';

describe('SearchGuidedComponent', () => {
  let component: SearchGuidedComponent;
  let fixture: ComponentFixture<SearchGuidedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchGuidedComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
      ],
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
