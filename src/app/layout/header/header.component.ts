import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationEnd, RouterLink, Router } from '@angular/router';
import { SearchGuidedComponent } from "../../search-guided/search-guided.component";
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    imports: [RouterLink, SearchGuidedComponent],
    host: {'[class.dark]':'isDarkTheme'}
})
export class HeaderComponent {
  /* Disable transitions on first load to prevent the header from sliding in */
  protected enableTransitions = false;

  protected scrolled = true;
  protected isOverflowing = false;

  protected showMenu = false;
  protected showSearch = true;

  searchClicked: boolean = false;
  isDarkTheme: boolean = false;

  private documentClickListener: Function | null = null;
  private windowResizeListener: Function | null = null;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSearch = this.router.url !== '/search';
        if (this.searchClicked) {
          this.searchClicked = false;
        }
      }
    });
  }

  onSearchClick() {
    this.searchClicked = true;
    setTimeout(() => {
      this.router.navigate(['/search']);
      window.scrollTo(0, 0);
    }, 600);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;

    // When the menu is shown, add a listener to close it when clicking outside 
    // or resizing the window above 1024px
    if (this.showMenu) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside) {
          this.showMenu = false;
          this.removeMenuListeners();
        }
      });
      this.windowResizeListener = this.renderer.listen('window', 'resize', (event) => {
        if (event.target.innerWidth > 1024) {
          this.showMenu = false;
          this.removeMenuListeners();
        }
      });
    } else {
      this.removeMenuListeners();
    }
  }

  removeMenuListeners() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
    if (this.windowResizeListener) {
      this.windowResizeListener();
      this.windowResizeListener = null;
    }
  }
}
