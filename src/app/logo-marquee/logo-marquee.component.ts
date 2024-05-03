import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-logo-marquee',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './logo-marquee.component.html',
  styleUrl: './logo-marquee.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class LogoMarqueeComponent {
  supporters: string[] = [
    'assets/images/logo-cresc_algarve_2020.png',
    'assets/images/logo-lisboa_2020.webp',
    'assets/images/logo-norte_2020.png',
    'assets/images/logo-portugal_2020.png',
    'assets/images/logo-uniao_europeia_fundos_europeus.png',
    'assets/images/logo-fct.png',
  ];

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
