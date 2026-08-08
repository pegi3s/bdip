import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

/** Width above which the mobile menu auto-closes on resize. */
const DESKTOP_BREAKPOINT_PX = 1024;

/** Delay before navigating to /search, giving the expand animation time to play. */
const SEARCH_NAVIGATION_DELAY_MS = 600;

interface NavLink {
  path: string;
  text: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterLink, SvgIconComponent],
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  /* Disable transitions on first load to prevent the header from sliding in */
  protected readonly enableTransitions = signal(false);
  protected readonly scrolled = signal(true);

  protected readonly showMenu = signal(false);
  protected readonly showSearch = signal(true);
  protected readonly searchClicked = signal(false);
  protected readonly currentSection = signal('');
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  protected readonly links: NavLink[] = [
    { path: '/search', text: 'Containers', queryParams: { showAll: 'true' } },
    { path: '/getting-started', text: 'Getting Started' },
    { path: '/advanced', text: 'Advanced' },
    { path: '/tutorials', text: 'Tutorials' },
  ];

  private pendingSearchNavigation: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentSection.set(event.url);
        this.showSearch.set(!this.router.url.includes('/search'));
        this.searchClicked.set(false);
      });

    this.destroyRef.onDestroy(() => clearTimeout(this.pendingSearchNavigation));
  }

  protected matchPath(link: NavLink): boolean {
    if (!this.currentSection().includes(link.path)) {
      return false;
    }

    if (!link.queryParams) {
      return true;
    }

    const currentQueryParams = this.router.parseUrl(this.router.url)
      .queryParams as Record<string, string>;

    return Object.entries(link.queryParams).every(
      ([key, value]) => currentQueryParams[key] === value,
    );
  }

  protected onSearchClick(): void {
    this.searchClicked.set(true);
    this.pendingSearchNavigation = setTimeout(() => {
      void this.router.navigate(['/search']);
    }, SEARCH_NAVIGATION_DELAY_MS);
  }

  protected toggleMenu(): void {
    this.showMenu.update((open) => !open);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    if (!this.showMenu()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const clickedOutside = !this.elementRef.nativeElement.contains(target);
    const clickedNavItem =
      target?.tagName === 'A' ||
      target?.tagName === 'IMG' ||
      target?.closest('.search-button') !== null;

    if (clickedOutside || clickedNavItem) {
      this.showMenu.set(false);
    }
  }

  @HostListener('window:resize', ['$event'])
  protected onWindowResize(event: UIEvent): void {
    const width = (event.target as Window).innerWidth;
    if (this.showMenu() && width > DESKTOP_BREAKPOINT_PX) {
      this.showMenu.set(false);
    }
  }
}
