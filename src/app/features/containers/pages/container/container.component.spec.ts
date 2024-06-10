import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ContainerComponent } from './container.component';

describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'container/:name', component: ContainerComponent }
        ])
      ]
    })
    .compileComponents();

    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/container/bedtools', ContainerComponent);
    harness.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
