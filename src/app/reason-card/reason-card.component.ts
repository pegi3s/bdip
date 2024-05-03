import { Component, Input, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-reason-card',
  standalone: true,
  imports: [],
  templateUrl: './reason-card.component.html',
  styleUrl: './reason-card.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class ReasonCardComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
