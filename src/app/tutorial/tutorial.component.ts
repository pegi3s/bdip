import { Component, ElementRef, ViewEncapsulation, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TutorialService } from '../services/tutorial.service';
import { Tutorial } from '../models/tutorial';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [RouterLink, MarkdownModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css', '../markdown-body.css']
})
export class TutorialComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  tutorialService: TutorialService = inject(TutorialService);
  
  tutorialName: string = '';
  headings?: Element[];
  tutorials: Tutorial[];

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.activatedRoute.params.subscribe(params => {
      this.tutorialName = this.activatedRoute.snapshot.params['name'];
    });
    this.tutorials = this.tutorialService.getTutorials();
  }

  getHeadings() {
    this.headings = Array.from(this.elementRef.nativeElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    console.log(this.headings);
  }
}
