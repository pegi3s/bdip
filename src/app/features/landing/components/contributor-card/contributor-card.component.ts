import { Component, inject, input } from '@angular/core';
import { Contributor } from '../../models/contributor.model';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-contributor-card',
  standalone: true,
  imports: [],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css',
  host: { '[class.dark]': 'isDarkTheme' },
})
export class ContributorCardComponent {
  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  /* Inputs */
  contributor = input.required<Contributor>();

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }
}
