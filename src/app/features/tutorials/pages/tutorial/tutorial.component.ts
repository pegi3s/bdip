import { Component, ElementRef, inject, Signal, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TutorialService } from '../../../../services/tutorial.service';
import { Tutorial } from '../../../../models/tutorial';
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [RouterLink, MarkdownModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css', '../../../../shared/styles/markdown-body.css'],
  host: {'[class.dark]':'isDarkTheme()'}
})
export class TutorialComponent {
  /* Services */
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private viewportScroller: ViewportScroller = inject(ViewportScroller);
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private tutorialService: TutorialService = inject(TutorialService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  readonly clipboardButton = ClipboardButtonComponent;

  /* Data */
  tutorials: Tutorial[] = [];
  selectedTutorial = signal<Tutorial | undefined>(undefined);
  headings?: Element[];

  constructor() {
    this.tutorialService.getTutorials().subscribe(tutorials => {
      this.tutorials = tutorials;

      this.activatedRoute.params.subscribe(params => {
        const tutorialName = this.activatedRoute.snapshot.params['name'];
        this.selectedTutorial.set(tutorials.find(tutorial => tutorial.filename === tutorialName));
      });
    });
    this.viewportScroller.setOffset([0, 150]);
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  /**
   * Assigns unique IDs to headings in the component based on their text content.
   */
  getHeadings() {
    this.headings = Array.from(this.elementRef.nativeElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    this.headings.forEach(heading => {
      heading.id = heading.textContent!.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    });
  }
}
