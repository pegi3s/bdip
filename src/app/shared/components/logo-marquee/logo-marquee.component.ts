import {
  Component,
  inject,
  input,
  Signal,
} from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

export interface Logo {
  url: string;
  /** Used as the image's alt text — these logos are meaningful (they identify funders), not decorative. */
  name: string;
}

@Component({
  selector: 'app-logo-marquee',
  imports: [],
  templateUrl: './logo-marquee.component.html',
  styleUrl: './logo-marquee.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class LogoMarqueeComponent {
  /* Inputs */
  readonly logos = input.required<Logo[]>();

  /* Services */
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;
}
