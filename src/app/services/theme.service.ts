import { computed, effect, Service, Signal, signal } from '@angular/core';
import { Theme } from '../shared/enums/theme';

const THEME_STORAGE_KEY = 'theme';

/** Manual toggle order: light -> dark -> system (follow OS) -> light. */
const NEXT_THEME: Record<Theme, Theme> = {
  [Theme.LIGHT]: Theme.DARK,
  [Theme.DARK]: Theme.SYSTEM,
  [Theme.SYSTEM]: Theme.LIGHT,
};

@Service()
export class ThemeService {
  private readonly prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  private readonly _theme = signal<Theme>(this.readStoredTheme());
  private readonly systemPrefersDark = signal(this.prefersDarkQuery.matches);

  readonly theme: Signal<Theme> = this._theme.asReadonly();
  readonly isDarkTheme: Signal<boolean> = computed(() =>
    this._theme() === Theme.SYSTEM ? this.systemPrefersDark() : this._theme() === Theme.DARK,
  );

  constructor() {
    this.prefersDarkQuery.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
    });

    // Single source of truth for DOM/localStorage sync: reacts to manual
    // theme changes *and* OS-level preference changes, so nothing needs to
    // remember to call this after mutating state.
    effect(() => {
      document.body.setAttribute('data-theme', this.isDarkTheme() ? Theme.DARK : Theme.LIGHT);

      if (this._theme() === Theme.SYSTEM) {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, this._theme());
      }
    });
  }

  toggleTheme(): void {
    this._theme.update((current) => NEXT_THEME[current]);
  }

  private readStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? (stored as Theme) : Theme.SYSTEM;
  }
}
