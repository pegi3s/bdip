import { Component } from '@angular/core';

@Component({
  selector: 'app-clipboard-button',
  standalone: true,
  imports: [],
  templateUrl: './clipboard-button.component.html',
  styleUrl: './clipboard-button.component.css'
})
export class ClipboardButtonComponent {
  copied: boolean = false;

  onCopyToClipboard() {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1000);
  }
}
