import {
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { Tutorial } from '../../../../models/tutorial';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TutorialService } from '../../../../services/tutorial.service';
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { ViewportScroller } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  imports: [RouterLink, MarkdownModule],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class TutorialComponent {
  /* Services */
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly tutorialService = inject(TutorialService);
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  protected readonly clipboardButton = ClipboardButtonComponent;

  /* Data */
  protected readonly tutorials = toSignal(this.tutorialService.getTutorials(), {
    initialValue: [],
  });
  private readonly tutorialName = toSignal(
    this.activatedRoute.params.pipe(map((params) => params['name'] as string)),
    { initialValue: this.activatedRoute.snapshot.params['name'] as string },
  );
  protected readonly selectedTutorial = computed<Tutorial | undefined>(() =>
    this.tutorials().find((tutorial) => tutorial.filename === this.tutorialName()),
  );
  protected readonly headings = signal<Element[]>([]);

  constructor() {
    this.viewportScroller.setOffset([0, 150]);

    // Clear the previous tutorial's heading anchors whenever the route changes;
    // getHeadings() repopulates them once the new tutorial's markdown finishes rendering.
    this.activatedRoute.params.pipe(takeUntilDestroyed()).subscribe(() => {
      this.headings.set([]);
    });
  }

  /**
   * Assigns unique IDs to headings in the component based on their text content.
   */
  protected getHeadings(): void {
    const headings = Array.from(
      this.elementRef.nativeElement.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    ) as HTMLElement[];

    const usedIds = new Set<string>();
    headings.forEach((heading, index) => {
      const slug = (heading.textContent ?? '')
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');
      heading.id = this.makeUniqueId(slug || `section-${index}`, usedIds);
    });

    this.headings.set(headings);
  }

  /** Appends a numeric suffix until `baseId` no longer collides with an already-used id. */
  private makeUniqueId(baseId: string, usedIds: Set<string>): string {
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }
    usedIds.add(id);
    return id;
  }
}
