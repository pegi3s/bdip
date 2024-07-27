import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { map } from 'rxjs';
import { Theme } from '../../enums/theme';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css',
  host: { '[class.dark]': 'isDarkTheme' }
})
export class ThemeToggleComponent {
  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;
  themeIcon: string = '';

  constructor() {
    this.themeService.getTheme().pipe(
      map(theme => this.getThemeIcon(theme))
    );
    this.themeService.getTheme().subscribe(theme => {
      this.getThemeIcon(theme);
    });
    this.themeService.isDarkTheme().subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  getThemeIcon(theme: Theme): void {
    if (theme === Theme.LIGHT) {
      this.themeIcon = 'assets/icons/material-symbols/light_mode_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg';
    } else if (theme === Theme.DARK) {
      this.themeIcon = 'assets/icons/material-symbols/dark_mode_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg';
    } else {
      this.themeIcon = 'assets/icons/material-symbols/desktop_windows_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg';
    }
  }
}
