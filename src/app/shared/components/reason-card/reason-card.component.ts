import {
  Component,
  inject,
  input,
  Signal,
} from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-reason-card',
  imports: [SvgIconComponent],
  templateUrl: './reason-card.component.html',
  styleUrl: './reason-card.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class ReasonCardComponent {
  /* Input */
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  /* Services */
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;
}
