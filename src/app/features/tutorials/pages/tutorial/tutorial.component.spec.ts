import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMarkdown } from 'ngx-markdown';

import { TutorialComponent } from './tutorial.component';

describe('TutorialComponent', () => {
  let component: TutorialComponent;
  let fixture: ComponentFixture<TutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMarkdown(),
        provideRouter([
          { path: 'tutorials/:name', component: TutorialComponent }
        ])
      ]
    })
    .compileComponents();
    
    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/tutorials/docker-in-docker', TutorialComponent);
    harness.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
