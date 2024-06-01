import { Component, ElementRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TutorialService } from '../../../../services/tutorial.service';
import { Tutorial } from '../../../../models/tutorial';
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [RouterLink, MarkdownModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css', '../../../../shared/styles/markdown-body.css'],
  host: {'[class.dark]':'isDarkTheme'}
})
export class TutorialComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  tutorialService: TutorialService = inject(TutorialService);
  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  readonly clipboardButton = ClipboardButtonComponent;

  selectedTutorial = signal<Tutorial | undefined>(undefined);
  headings?: Element[];
  tutorials: Tutorial[] = [];

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.tutorialService.getTutorials().subscribe(tutorials => {
      this.tutorials = tutorials;

      this.activatedRoute.params.subscribe(params => {
        const tutorialName = this.activatedRoute.snapshot.params['name'];
        this.selectedTutorial.set(tutorials.find(tutorial => tutorial.filename === tutorialName));
      });
    });
    this.themeService.isDarkTheme().subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  getHeadings() {
    this.headings = Array.from(this.elementRef.nativeElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    console.log(this.headings);
  }
}
