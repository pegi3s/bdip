import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-icon-dropdown',
  imports: [SvgIconComponent],
  templateUrl: './icon-dropdown.component.html',
  styleUrl: './icon-dropdown.component.css',
})
export class IconDropdownComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly icon = input.required<string>();
  readonly items = input.required<DropdownItem[]>();
  readonly selected = model.required<number>();

  protected readonly isDropdownOpen = signal<boolean>(false);

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
  }

  protected selectItem(index: number): void {
    // Clicking the already-selected item clears the filter
    this.selected.set(this.selected() === index ? -1 : index);
    this.toggleDropdown();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    if (this.isDropdownOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isDropdownOpen.set(false);
    }
  }
}

interface DropdownItem {
  name: string;
  icon?: string;
}
