import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TutorialService } from '../../../../services/tutorial.service';
import { ThemeService } from '../../../../services/theme.service';
import { VideoTutorial } from '../../../../models/video-tutorial';

@Component({
  selector: 'app-tutorials-landing',
  imports: [RouterLink],
  templateUrl: './tutorials-landing.component.html',
  styleUrl: './tutorials-landing.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class TutorialsLandingComponent {
  /* Services */
  private readonly themeService = inject(ThemeService);
  private readonly tutorialService = inject(TutorialService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  /* Data */
  protected readonly tutorials = toSignal(this.tutorialService.getTutorials(), {
    initialValue: [],
  });
  protected readonly videoTutorials: Signal<VideoTutorial[] | undefined> =
    this.tutorialService.videoTutorials.value;
}
