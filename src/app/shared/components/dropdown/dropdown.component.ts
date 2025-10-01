import { Component, ElementRef, inject, input, model, Renderer2, signal } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  selector: 'app-dropdown',
  imports: [SvgIconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  private renderer: Renderer2 = inject(Renderer2);
  private elementRef: ElementRef = inject(ElementRef);

  items = input.required<DropdownItem[]>();
  selected = model.required<number>();

  isDropdownOpen = signal<boolean>(false);

  private documentClickListener?: (() => void);

  toggleDropdown(): void {
    this.isDropdownOpen.update(value => !value);
    if (this.isDropdownOpen()) {
      this.addClickOutsideListener();
    } else {
      this.removeClickOutsideListener();
    }
  }

  selectItem(index: number): void {
    this.selected.set(index);
    this.toggleDropdown();
  }

  private addClickOutsideListener(): void {
    this.documentClickListener = this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        if (this.isDropdownOpen()) {
          this.toggleDropdown();
        }
      }
    });
  }

  private removeClickOutsideListener(): void {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = undefined;
    }
  }

  ngOnDestroy(): void {
    this.removeClickOutsideListener();
  }
}

interface DropdownItem {
  name: string;
  icon?: string;
}
