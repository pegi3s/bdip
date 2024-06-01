import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TutorialService } from '../../../../services/tutorial.service';
import { Tutorial } from '../../../../models/tutorial';

@Component({
  selector: 'app-tutorials-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tutorials-landing.component.html',
  styleUrl: './tutorials-landing.component.css'
})
export class TutorialsLandingComponent {
  tutorialService: TutorialService = inject(TutorialService);
  tutorials = signal<Tutorial[]>([]);

  ngOnInit() {
    this.tutorialService.getTutorials().subscribe(tutorials => {
      this.tutorials.set(tutorials);
    });
  }
}
