import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  themeService: ThemeService = inject(ThemeService);
  themeIcon: string = '';

  constructor() {
    this.themeService.getTheme().pipe(
      map(theme => this.getThemeIcon(theme))
    );
    this.themeService.getTheme().subscribe(theme => {
      this.getThemeIcon(theme);
    });
  }

  getThemeIcon(theme: Theme): void {
    if (theme === Theme.LIGHT) {
      this.themeIcon = 'light_mode';
    } else if (theme === Theme.DARK) {
      this.themeIcon = 'dark_mode';
    } else {
      this.themeIcon = 'desktop_windows';
    }
  }
}

enum Theme { LIGHT = 'light', DARK = 'dark', SYSTEM = 'system' };
