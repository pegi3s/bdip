import { Component, computed, inject, input, Signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Contributor } from '../../models/contributor.model';
import { ThemeService } from '../../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-contributor-card',
  imports: [NgOptimizedImage, SvgIconComponent],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class ContributorCardComponent {
  /* Services */
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  /* Inputs */
  readonly contributor = input.required<Contributor>();

  protected readonly periodLabel = computed(() => {
    const period = this.contributor().period;

    if (!period) {
      return undefined;
    }

    const from = period.from.trim();
    const to = period.to?.trim();

    if (from && to) {
      return `${from} - ${to}`;
    }

    return `${from} - Present`;
  });
}
