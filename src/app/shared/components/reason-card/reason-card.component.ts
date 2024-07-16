import { Component, inject, input } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-reason-card',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './reason-card.component.html',
  styleUrl: './reason-card.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class ReasonCardComponent {
  /* Input */
  icon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();

  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
