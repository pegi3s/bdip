import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { CLIPBOARD_OPTIONS, ClipboardButtonComponent, provideMarkdown } from 'ngx-markdown';
import { baseUrl } from 'marked-base-url';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideMarkdown({
      loader: HttpClient,
      markedExtensions: [baseUrl('https://raw.githubusercontent.com/pegi3s/dockerfiles/master/tutorials/')],
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
    }),
    provideRouter(
      routes,
      withViewTransitions(),
      withComponentInputBinding()
    )
  ]
};
