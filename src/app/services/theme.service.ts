import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme: Theme;
  private theme: BehaviorSubject<Theme>;
  private darkTheme: BehaviorSubject<boolean>;

  constructor() {
    const theme = localStorage.getItem('theme');
    // If the user has set a theme, use it. Otherwise, use the system theme.
    this._theme = theme ?
      theme as Theme :
      window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;

    // Add data-theme attribute to the host element
    document.body.setAttribute('data-theme', this._theme);
    this.darkTheme = new BehaviorSubject<boolean>(this._theme === Theme.DARK);
    this.theme = new BehaviorSubject<Theme>(this._theme);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.toggleTheme();
    });
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

enum Theme { LIGHT = 'light', DARK = 'dark', SYSTEM = 'system' };
