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
  selector: 'app-dropdown',
  imports: [SvgIconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly items = input.required<DropdownItem[]>();
  readonly selected = model.required<number>();

  protected readonly isDropdownOpen = signal<boolean>(false);

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
  }

  protected selectItem(index: number): void {
    this.selected.set(index);
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
