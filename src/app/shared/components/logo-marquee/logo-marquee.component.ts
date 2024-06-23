import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-logo-marquee',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './logo-marquee.component.html',
  styleUrl: './logo-marquee.component.css',
  host: { '[class.dark]': 'isDarkTheme' },
})
export class LogoMarqueeComponent {
  /* Inputs */
  logos = input.required<string[]>();

  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
