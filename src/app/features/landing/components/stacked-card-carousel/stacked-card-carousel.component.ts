import { Component, signal, computed, inject, input, ChangeDetectionStrategy } from "@angular/core";
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DockerHubImage } from "../../../../models/docker-hub-image";
import { SvgIconComponent } from "angular-svg-icon";
import { Router } from "@angular/router";

type CardPosition = 'center' | 'left' | 'right' | 'hidden';

interface CarouselItem {
  type: string;
  image: DockerHubImage;
  version: Observable<string>;
}

/** How long each card stays centered before auto-advancing. Also drives the indicator's
 *  progress-bar animation via the --auto-rotate-duration custom property — keep these in sync
 *  by only changing this constant, not the CSS directly. */
const AUTO_ROTATE_INTERVAL_MS = 5000;

@Component({
  selector: 'app-stacked-card-carousel',
  imports: [AsyncPipe, DatePipe, TitleCasePipe, SvgIconComponent],
  templateUrl: './stacked-card-carousel.component.html',
  styleUrl: './stacked-card-carousel.component.css',
  host: { '[style.--auto-rotate-duration.ms]': 'autoRotateIntervalMs' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedCardCarouselComponent {
  private readonly router = inject(Router);

  protected readonly autoRotateIntervalMs = AUTO_ROTATE_INTERVAL_MS;

  // --- Inputs ---
  readonly items = input.required<CarouselItem[]>();

  // --- State ---
  readonly activeIndex = signal(0);

  // This subject triggers the timer reset
  private readonly autoRotateReset$ = new Subject<void>();

  // --- Computed Positions ---
  readonly cardStates = computed(() => {
    const total = this.items().length;
    const current = this.activeIndex();
    const states = new Map<number, CardPosition>();

    if (total === 0) return states;

    const getIndex = (offset: number) => (current + offset + total) % total;

    // Default all to hidden
    for (let i = 0; i < total; i++) states.set(i, 'hidden');

    // Set visible ones (z-index is handled in CSS)
    states.set(getIndex(-1), 'left');
    states.set(getIndex(1), 'right');
    states.set(current, 'center');

    return states;
  });

  constructor() {
    // --- The Magic Timer Logic ---
    // switchMap cancels the previous timer whenever a value is emitted
    this.autoRotateReset$.pipe(
      // Wait for the auto-rotate interval after the last interaction
      switchMap(() => timer(AUTO_ROTATE_INTERVAL_MS)),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.next();
    });

    // Start the timer initially
    this.autoRotateReset$.next();
  }

  // --- Navigation ---

  next(): void {
    const total = this.items().length;
    if (total <= 1) {
      return;
    }
    this.activeIndex.update((i) => (i + 1) % total);
    // Always reset the timer to ensure the loop continues
    this.autoRotateReset$.next();
  }

  prev(): void {
    const total = this.items().length;
    if (total <= 1) {
      return;
    }
    this.activeIndex.update((i) => (i - 1 + total) % total);
    this.autoRotateReset$.next(); // Reset timer
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
    this.autoRotateReset$.next(); // Reset timer
  }

  onCardClick(index: number): void {
    const state = this.cardStates().get(index);
    if (state === 'center') {
      const item = this.items()[index];
      this.router.navigate(['/container', item.image.name]);
    } else if (state === 'left') {
      this.prev();
    } else if (state === 'right') {
      this.next();
    }
  }

  // --- Touch Handling ---
  private touchStartX = 0;

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
    // Optional: Pause timer on touch start?
  }

  onTouchEnd(e: TouchEvent): void {
    const touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;

    if (touchEndX < this.touchStartX - threshold) this.next();
    if (touchEndX > this.touchStartX + threshold) this.prev();
  }
}
