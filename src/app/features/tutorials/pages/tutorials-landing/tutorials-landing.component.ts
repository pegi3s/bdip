import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TutorialService } from '../../../../services/tutorial.service';
import { Tutorial } from '../../../../models/tutorial';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-tutorials-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tutorials-landing.component.html',
  styleUrl: './tutorials-landing.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class TutorialsLandingComponent {
  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;
  private tutorialService: TutorialService = inject(TutorialService);

  /* Data */
  tutorials = signal<Tutorial[]>([]);

  ngOnInit() {
    this.tutorialService.getTutorials().subscribe(tutorials => {
      this.tutorials.set(tutorials);
    });
    this.themeService.isDarkTheme().subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }
}
