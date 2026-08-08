import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';

/** Used until the header has actually been measured. */
const DEFAULT_HEADER_HEIGHT_PX = 115;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: { '[style.--header-height.px]': 'headerHeight()' },
})
export class AppComponent {
  private readonly headerRef = viewChild(HeaderComponent, {
    read: ElementRef<HTMLElement>,
  });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly headerHeight = signal(DEFAULT_HEADER_HEIGHT_PX);

  constructor() {
    afterNextRender(() => this.observeHeaderHeight());
  }

  private observeHeaderHeight(): void {
    const headerEl = this.headerRef()?.nativeElement;
    if (!headerEl) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      this.headerHeight.set(height);
    });

    resizeObserver.observe(headerEl);
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());
  }
}
