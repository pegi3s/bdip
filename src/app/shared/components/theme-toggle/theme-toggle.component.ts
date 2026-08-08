import { Component, computed, inject, Signal } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { Theme } from '../../enums/theme';
import { SvgIconComponent } from 'angular-svg-icon';

const THEME_ICONS: Record<Theme, string> = {
  [Theme.LIGHT]:
    'assets/icons/material-symbols/light_mode_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg',
  [Theme.DARK]:
    'assets/icons/material-symbols/dark_mode_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg',
  [Theme.SYSTEM]:
    'assets/icons/material-symbols/desktop_windows_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg',
};

@Component({
  selector: 'app-theme-toggle',
  imports: [SvgIconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);

  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;
  protected readonly theme: Signal<Theme> = this.themeService.theme;
  protected readonly themeIcon: Signal<string> = computed(
    () => THEME_ICONS[this.theme()],
  );
}
