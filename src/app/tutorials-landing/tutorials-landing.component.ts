import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TutorialService } from '../services/tutorial.service';
import { Tutorial } from '../models/tutorial';

@Component({
  selector: 'app-tutorials-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tutorials-landing.component.html',
  styleUrl: './tutorials-landing.component.css'
})
export class TutorialsLandingComponent {
  tutorialService: TutorialService = inject(TutorialService);
  tutorials: Tutorial[] = this.tutorialService.getTutorials();
}
