import { ApplicationConfig, inject, provideZoneChangeDetection, SecurityContext } from '@angular/core';
import { Router, provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { CLIPBOARD_OPTIONS, ClipboardButtonComponent, provideMarkdown } from 'ngx-markdown';
import { baseUrl } from 'marked-base-url';
import markedAlert from 'marked-alert';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideMatomo, withRouter } from "ngx-matomo-client";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideAngularSvgIcon(),
    provideHttpClient(withFetch()),
    provideMarkdown({
      loader: HttpClient,
      markedExtensions: [
        baseUrl('https://raw.githubusercontent.com/pegi3s/dockerfiles/master/metadata/web/tutorials/'),
        markedAlert(),
        /* marked-gfm-heading-id won't work due DomSanitizer removing them */
      ],
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
      sanitize: SecurityContext.NONE,
    }),
    provideMatomo(
      {
        trackerUrl: environment.matomoTrackerUrl,
        siteId: environment.matomoSiteId,
      },
      withRouter(),
    ),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({transition}) => {
          const router = inject(Router);
          const url = router.getCurrentNavigation()!.finalUrl!.root.children['primary'];
          const goingToSearch = url?.segments[0].path == 'search';
          // Skip the transition if we are going to the search page
          // to avoid mixing it with the custom one defined
          if (goingToSearch) {
            transition.skipTransition();
          }
        },
      }),
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
};
