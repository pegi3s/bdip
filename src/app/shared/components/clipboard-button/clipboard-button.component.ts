import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import ClipboardJS from 'clipboard';

/** How long the "copied" success state stays shown before reverting to the copy icon. */
const COPIED_RESET_DELAY_MS = 1000;

@Component({
  selector: 'app-clipboard-button',
  imports: [SvgIconComponent],
  templateUrl: './clipboard-button.component.html',
  styleUrl: './clipboard-button.component.css',
})
export class ClipboardButtonComponent {
  private readonly destroyRef = inject(DestroyRef);

  /* Input */
  readonly element = input<ElementRef<any>>();
  readonly text = input<string>();

  /* State */
  protected readonly copied = signal<boolean>(false);

  private pendingCopiedReset: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.pendingCopiedReset));
  }

  /**
   * Copies the content of the element or text to the clipboard.
   * After copying, it sets a `copied` flag to true for 1 second to indicate success.
   */
  protected onCopyToClipboard(): void {
    const element = this.element();
    const text = this.text();

    if (element) {
      ClipboardJS.copy(element.nativeElement);
      document.getSelection()?.removeAllRanges();
    } else if (text) {
      ClipboardJS.copy(text);
    }

    this.copied.set(true);
    clearTimeout(this.pendingCopiedReset);
    this.pendingCopiedReset = setTimeout(() => {
      this.copied.set(false);
    }, COPIED_RESET_DELAY_MS);
  }
}
