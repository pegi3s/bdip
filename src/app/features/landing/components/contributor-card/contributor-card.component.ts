import { Component, inject, input } from '@angular/core';
import { Component, inject, input, Signal } from "@angular/core";
import { Contributor } from '../../models/contributor.model';
import { ThemeService } from '../../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-contributor-card',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class ContributorCardComponent {
  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  /* Inputs */
  contributor = input.required<Contributor>();

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();
  }
}
