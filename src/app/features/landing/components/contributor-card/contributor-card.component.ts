import { Component, inject, input } from '@angular/core';
import { Contributor } from '../../models/contributor.model';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-contributor-card',
  standalone: true,
  imports: [],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class ContributorCardComponent {
  contributor = input.required<Contributor>();

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
