import { afterNextRender, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme } from '../shared/enums/theme';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme: Theme;
  private theme: BehaviorSubject<Theme>;
  private darkTheme: BehaviorSubject<boolean>;

  /*constructor() {
    // Placeholders for the theme and darkTheme observables
    this._theme = Theme.SYSTEM;
    this.theme = new BehaviorSubject<Theme>(this._theme);
    this.darkTheme = new BehaviorSubject<boolean>(true);

    afterNextRender(() => {
      const localTheme = localStorage.getItem('theme');
      // If the user has set a theme, use it. Otherwise, use the system theme.
      this._theme = localTheme ?
        localTheme as Theme :
        //window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
        Theme.SYSTEM;

      const finalTheme = this._theme === Theme.SYSTEM ? window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT : this._theme;
      // Add data-theme attribute to the host element
      document.body.setAttribute('data-theme', finalTheme);
      // this.darkTheme = new BehaviorSubject<boolean>(finalTheme === Theme.DARK);
      // this.theme = new BehaviorSubject<Theme>(this._theme);

      this.darkTheme.next(finalTheme === Theme.DARK);
      this.theme.next(this._theme);

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      prefersDark.addEventListener('change', (mediaQuery) => {
        this.toggleTheme();
      });
    });
  }*/

    // https://github.com/angular/angular/blob/a84cb62522bff516e3b05eaa7b7ff9a0ca46c561/adev/src/index.html#L9
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const localTheme = localStorage.getItem('theme');
      // If the user has set a theme, use it. Otherwise, use the system theme.
      this._theme = localTheme ?
        localTheme as Theme :
        //window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
        Theme.SYSTEM;

      const finalTheme = this._theme === Theme.SYSTEM ? window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT : this._theme;
      // Add data-theme attribute to the host element
      document.body.setAttribute('data-theme', finalTheme);
      this.darkTheme = new BehaviorSubject<boolean>(finalTheme === Theme.DARK);
      this.theme = new BehaviorSubject<Theme>(this._theme);

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      prefersDark.addEventListener('change', (mediaQuery) => {
        this.toggleTheme();
      });
      console.log('Client side rendering');
    } else {
      console.log('Server side rendering');
      this._theme = Theme.SYSTEM;
      this.theme = new BehaviorSubject<Theme>(this._theme);
      this.darkTheme = new BehaviorSubject<boolean>(false);
    }
  }

  toggleTheme(manual: boolean = false): void {
    if (manual) {
      if (this._theme === Theme.LIGHT) {
        this._theme = Theme.DARK;
      } else if (this._theme === Theme.DARK) {
        this._theme = Theme.SYSTEM;
      } else {
        this._theme = Theme.LIGHT;
      }
    }

    let theme = this._theme;
    if (this._theme === Theme.SYSTEM) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', this._theme);
    }

    document.body.setAttribute('data-theme', theme);
    this.darkTheme.next(theme === Theme.DARK);
    this.theme.next(this._theme);
  }

  isDarkTheme(): Observable<boolean> {
    return this.darkTheme;
  }

  getTheme(): Observable<Theme> {
    return this.theme;
  }
}
