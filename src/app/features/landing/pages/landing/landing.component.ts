import { ChangeDetectionStrategy, Component, ElementRef, inject, Signal, viewChild } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { ContributorCardComponent } from "../../components/contributor-card/contributor-card.component";
import { ContributorService } from "../../../../services/contributor.service";
import { Contributor } from "../../models/contributor.model";
import { LogoMarqueeComponent } from "../../../../shared/components/logo-marquee/logo-marquee.component";
import { Router, RouterLink } from "@angular/router";
import { ThemeService } from "../../../../services/theme.service";
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { ReasonCardComponent } from "../../../../shared/components/reason-card/reason-card.component";
import { SvgIconComponent } from "angular-svg-icon";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import {
  StackedCardCarouselComponent
} from "../../../../shared/components/stacked-card-carousel/stacked-card-carousel.component";
import { ContainerService } from "../../../../services/container.service";
import { DockerHubImage } from "../../../../models/docker-hub-image";
import { shareReplay } from "rxjs/operators";

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    host: { '[class.dark]': 'isDarkTheme()' },
    imports: [ContributorCardComponent, LogoMarqueeComponent, ClipboardButtonComponent, RouterLink, ReasonCardComponent, SvgIconComponent, AsyncPipe, StackedCardCarouselComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  /* Services */
  private readonly router: Router = inject(Router);
  private readonly themeService: ThemeService = inject(ThemeService);
  readonly isDarkTheme: Signal<boolean>;
  private readonly containerService: ContainerService = inject(ContainerService);
  private readonly contributorService: ContributorService = inject(ContributorService);

  /* HTML Elements */
  citingQuoteElem = viewChild<ElementRef>('citingQuote');

  /* Data */
  supporters: string[] = [
    'assets/images/supporters/logo-cresc_algarve_2020.png',
    'assets/images/supporters/logo-lisboa_2020.webp',
    'assets/images/supporters/logo-norte_2020.png',
    'assets/images/supporters/logo-portugal_2020.png',
    'assets/images/supporters/logo-uniao_europeia_fundos_europeus.png',
    'assets/images/supporters/logo-fct.png',
  ];
  features = [
    {
      icon: 'assets/icons/fluent-icons/ic_fluent_play_circle_24_filled.svg',
      title: 'Effortless Deployment and Ready-to-Run',
      description: 'Simple installation of Docker grants access to a variety of scientific tools without complex setups and ready to run.',
      color: 0,
    },
    {
      icon: 'assets/icons/fluent-icons/ic_fluent_laptop_24_filled.svg',
      title: 'Portability, Consistency, and Cross-Platform Compatibility',
      description: 'Ensures consistent performance across different computing environments, making it easy to switch between Linux and Windows platforms.',
      color: 130,
    },
    {
      icon: 'assets/icons/material-symbols/hub_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg',
      title: 'Centralized Repository (Docker Hub)',
      description: 'Publicly share and access Docker images, fostering collaboration within the research community.',
      color: 240,
    },
    {
      icon: 'assets/icons/fluent-icons/ic_fluent_organization_horizontal_24_filled.svg',
      title: 'Pipeline Integration',
      description: 'Ideal for integration into bioinformatics pipelines, ensuring consistency and reproducibility in scientific analyses.',
      color: 300,
    }
  ];

  recentImages$: Observable<{ type: string; image: DockerHubImage; version: string }[]>;

  /* State */
  searchClicked: boolean = false;

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();
    this.recentImages$ = this.getMostRecentImages();
  }

  onSearchClick() {
    this.searchClicked = true;
    setTimeout(() => {
      this.router.navigate(['/search']);
    }, 600);
  }

  getAuthors(): Observable<Contributor[]> {
    return this.contributorService.getAuthors();
  }

  getContributors(): Observable<Contributor[]> {
    return this.contributorService.getContributors();
  }

  getMostRecentImages(): Observable<{ type: string; image: DockerHubImage; version: string }[]> {
    return this.containerService.getAllContainersInfo().pipe(
      switchMap((containersInfo) => {
        const sortedImages = [...containersInfo.values()]
          .sort((a, b) => {
            const lastUpdatedA = Date.parse(a.last_updated);
            const lastUpdatedB = Date.parse(b.last_updated);
            const creationDateA = Date.parse(a.date_registered);
            const creationDateB = Date.parse(b.date_registered);

            // Compare the most recent of either last_updated or creation_date
            return Math.max(lastUpdatedB, creationDateB) - Math.max(lastUpdatedA, creationDateA);
          })
          .slice(0, 5); // Take the top 5 most recent images

        if (sortedImages.length === 0) {
          return of([]);
        }

        // Batch the tag requests
        const tagRequests = sortedImages.map(image =>
          this.containerService.getContainerTags(image.name).pipe(
            map(tags => {
              const lastUpdatedDate = Date.parse(image.last_updated);
              const creationDate = Date.parse(image.date_registered);
              const type = lastUpdatedDate > creationDate ? 'updated' : 'new';
              let version = '';

              if (type === 'updated') {
                // Find the most recent tag based on last_updated, excluding tag latest
                version = tags.filter(tag => tag.name !== 'latest').sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated))[0].name;
              }

              return { type, image, version };
            })
          )
        );

        return forkJoin(tagRequests);
      }),
      // Add shareReplay to prevent multiple subscriptions from triggering multiple API calls
      shareReplay(1)
    );
  }
}
