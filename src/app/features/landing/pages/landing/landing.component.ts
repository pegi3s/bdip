import { Component, computed, DestroyRef, ElementRef, inject, signal, Signal, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ContributorCardComponent } from "../../components/contributor-card/contributor-card.component";
import { ContributorService } from "../../../../services/contributor.service";
import { LogoMarqueeComponent, Logo } from "../../../../shared/components/logo-marquee/logo-marquee.component";
import { Router, RouterLink } from "@angular/router";
import { ThemeService } from "../../../../services/theme.service";
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { ReasonCardComponent } from "../../../../shared/components/reason-card/reason-card.component";
import { SvgIconComponent } from "angular-svg-icon";
import { map } from "rxjs";
import { StackedCardCarouselComponent } from "../../components/stacked-card-carousel/stacked-card-carousel.component";
import { ContainerService } from "../../../../services/container.service";

/** Delay before navigating to /search, giving the halo expand animation time to play. */
const SEARCH_NAVIGATION_DELAY_MS = 600;

const CONTACT_EMAIL = 'pegi3sdocker@gmail.com';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
  imports: [ContributorCardComponent, LogoMarqueeComponent, ClipboardButtonComponent, RouterLink, ReasonCardComponent, SvgIconComponent, StackedCardCarouselComponent],
})
export class LandingComponent {
  /* Services */
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;
  private readonly containerService = inject(ContainerService);
  private readonly contributorService = inject(ContributorService);
  private readonly destroyRef = inject(DestroyRef);

  /* HTML Elements */
  protected readonly citingQuoteElem = viewChild<ElementRef>('citingQuote');

  /* Data */
  protected readonly supporters: Logo[] = [
    { url: 'assets/images/supporters/logo-cresc_algarve_2020.png', name: 'CRESC Algarve 2020' },
    { url: 'assets/images/supporters/logo-lisboa_2020.webp', name: 'Lisboa 2020' },
    { url: 'assets/images/supporters/logo-norte_2020.png', name: 'Norte 2020' },
    { url: 'assets/images/supporters/logo-portugal_2020.png', name: 'Portugal 2020' },
    { url: 'assets/images/supporters/logo-uniao_europeia_fundos_europeus.png', name: 'União Europeia - Fundos Europeus' },
    { url: 'assets/images/supporters/logo-fct.png', name: 'Fundação para a Ciência e a Tecnologia (FCT)' },
  ];
  protected readonly features = [
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

  /** CSS classes for the six floating decorative icons around the search halo — see .svg1-.svg6
   *  in the stylesheet for their individual position/rotation/delay. */
  protected readonly floatingIconClasses = ['svg1', 'svg2', 'svg3', 'svg4', 'svg5', 'svg6'];

  private readonly containerMetadata = this.containerService.getAllContainersMetadataRes().value;
  private readonly containersInfo = this.containerService.getAllContainersInfoRes().value;
  protected readonly mostRecentImages = computed(() => {
    const numberOfImages = 5;
    const containerMetadata = this.containerMetadata();
    const containersInfo = this.containersInfo();

    if (!containerMetadata || !containersInfo) return [];

    return [...containersInfo.values()]
      .filter(image => containerMetadata.has(image.name))
      .sort((a, b) => {
        const lastUpdatedA = Date.parse(a.last_updated);
        const lastUpdatedB = Date.parse(b.last_updated);
        const creationDateA = Date.parse(a.date_registered);
        const creationDateB = Date.parse(b.date_registered);
        // Compare the most recent of either last_updated or creation_date
        return Math.max(lastUpdatedB, creationDateB) - Math.max(lastUpdatedA, creationDateA);
      })
      .slice(0, numberOfImages)
      .map(image => {
        const lastUpdatedDate = Date.parse(image.last_updated);
        const creationDate = Date.parse(image.date_registered);
        const type = lastUpdatedDate > creationDate ? 'updated' : 'new';

        const version = this.containerService.getContainerTags(image.name).pipe(
          map(tags => {
            if (tags.length > 1) {
              // Find the most recent tag based on last_updated, excluding tag latest
              return tags
                .filter(tag => tag.name !== 'latest')
                .sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated))[0].name;
            }
            return tags[0]?.name || '';
          })
        );

        return { type, image, version };
      });
  });

  /* State */
  protected readonly searchClicked = signal(false);
  protected readonly authors = toSignal(this.contributorService.getAuthors(), {
    initialValue: [],
  });
  protected readonly contributors = toSignal(this.contributorService.getContributors(), {
    initialValue: [],
  });

  private pendingSearchNavigation: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.pendingSearchNavigation));
  }

  protected onSearchClick(): void {
    this.searchClicked.set(true);
    this.pendingSearchNavigation = setTimeout(() => {
      void this.router.navigate(['/search']);
    }, SEARCH_NAVIGATION_DELAY_MS);
  }

  /**
   * Builds a mailto: link from the contact form fields and navigates to it. Submitting a form
   * directly to a mailto: action (the previous approach) isn't reliably supported by modern
   * browsers, so this constructs the link client-side instead — the working equivalent of what
   * that was trying to do.
   */
  protected onContactFormSubmit(subject: string, body: string): void {
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (body) params.set('body', body);
    const query = params.toString();
    window.location.href = `mailto:${CONTACT_EMAIL}${query ? '?' + query : ''}`;
  }
}
