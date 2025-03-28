import { Component, signal, inject, input, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { interval, Observable, Subject } from "rxjs";
import { takeUntil, filter } from 'rxjs/operators';
import { DockerHubImage } from "../../../../models/docker-hub-image";
import { SvgIconComponent } from "angular-svg-icon";
import { Router } from "@angular/router";

@Component({
  selector: 'app-stacked-card-carousel',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './stacked-card-carousel.component.html',
  styleUrl: './stacked-card-carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedCardCarouselComponent {
  readonly router = inject(Router);

  // State
  activeIndex = signal(0);
  isAnimating = signal(false);

  // Data
  readonly items = input.required<{ type: string; image: DockerHubImage; version: Observable<string> }[]>();

  // For proper cleanup
  private destroy$ = new Subject<void>();

  // Lifecycle hooks
  ngOnInit() {
    this.startAutoRotation();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startAutoRotation() {
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.isAnimating())
      )
      .subscribe(() => this.handleNext());
  }

  // Helper methods
  getCardIndex(baseIndex: number): number {
    // Handle circular indexing
    let index = baseIndex;
    if (index < 0) index = this.items().length + index;
    return index % this.items().length;
  }

  // Navigation methods
  handleNext() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    this.activeIndex.set((this.activeIndex() + 1) % this.items().length);

    setTimeout(() => {
      this.isAnimating.set(false);
    }, 600); // Match with animation duration
  }

  handlePrev() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    this.activeIndex.set((this.activeIndex() - 1 + this.items().length) % this.items().length);

    setTimeout(() => {
      this.isAnimating.set(false);
    }, 600); // Match with animation duration
  }

  goToSlide(index: number) {
    if (this.isAnimating() || index === this.activeIndex()) return;

    this.isAnimating.set(true);
    this.activeIndex.set(index);

    setTimeout(() => {
      this.isAnimating.set(false);
    }, 600);
  }

  // Position determination
  getCardPosition(index: number): string {
    const visibleIndices = [
      this.getCardIndex(this.activeIndex() - 1),
      this.activeIndex(),
      this.getCardIndex(this.activeIndex() + 1)
    ];

    if (!visibleIndices.includes(index)) {
      return "hidden";
    }

    if (index === this.activeIndex()) {
      return "center";
    } else if (index === this.getCardIndex(this.activeIndex() - 1)) {
      return "left";
    } else if (index === this.getCardIndex(this.activeIndex() + 1)) {
      return "right";
    } else {
      return "hidden";
    }
  }

  // Function to handle card click based on position
  onCardClick(index: number) {
    const position = this.getCardPosition(index);
    if (position === "center") {
      this.router.navigate([`/container/${this.items()[index].image.name}`]);
    } else if (position === "right") {
      this.handleNext();
    } else if (position === "left") {
      this.handlePrev();
    }
  }
}
