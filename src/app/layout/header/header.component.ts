import { Component } from '@angular/core';
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

  constructor(
    private themeService: ThemeService,
    private router: Router,
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

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  onSearchClick() {
    this.searchClicked = true;
    setTimeout(() => {
      this.router.navigate(['/search']);
      window.scrollTo(0, 0);
    }, 600);
  }
}
