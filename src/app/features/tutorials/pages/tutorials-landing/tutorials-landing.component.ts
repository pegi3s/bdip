import { Component, inject, Signal, signal } from "@angular/core";
import { RouterLink } from '@angular/router';
import { TutorialService } from '../../../../services/tutorial.service';
import { Tutorial } from '../../../../models/tutorial';
import { ThemeService } from '../../../../services/theme.service';
import { VideoTutorial } from "../../../../models/video-tutorial";

@Component({
    selector: 'app-tutorials-landing',
    imports: [RouterLink],
    templateUrl: './tutorials-landing.component.html',
    styleUrl: './tutorials-landing.component.css',
    host: { '[class.dark]': 'isDarkTheme()' }
})
export class TutorialsLandingComponent {
  /* Services */
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;
  private tutorialService: TutorialService = inject(TutorialService);

  /* Data */
  tutorials = signal<Tutorial[]>([]);
  videoTutorials: Signal<VideoTutorial[] | undefined>;

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();
    this.videoTutorials = this.tutorialService.videoTutorials.value;
  }

  ngOnInit() {
    this.tutorialService.getTutorials().subscribe(tutorials => {
      this.tutorials.set(tutorials);
    });
  }
}
