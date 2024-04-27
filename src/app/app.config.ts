import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideMarkdown(),
    provideRouter(
      routes, 
      withViewTransitions(),
      withComponentInputBinding()
    )
  ]
};
