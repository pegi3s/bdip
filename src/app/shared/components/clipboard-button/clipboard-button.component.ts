import { Component, ElementRef, input } from '@angular/core';
import ClipboardJS from 'clipboard';

@Component({
  selector: 'app-clipboard-button',
  standalone: true,
  imports: [],
  templateUrl: './clipboard-button.component.html',
  styleUrl: './clipboard-button.component.css'
})
export class ClipboardButtonComponent {
  element = input<ElementRef<any>>();
  copied: boolean = false;

  onCopyToClipboard() {
    if (this.element()) {
      ClipboardJS.copy(this.element()?.nativeElement);
    }

    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1000);
  }
}
