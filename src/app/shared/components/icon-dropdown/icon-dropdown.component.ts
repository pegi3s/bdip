import { Component, ElementRef, inject, input, model, Renderer2, signal } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  selector: 'app-icon-dropdown',
  imports: [SvgIconComponent],
  templateUrl: './icon-dropdown.component.html',
  styleUrl: './icon-dropdown.component.css'
})
export class IconDropdownComponent {
  private renderer: Renderer2 = inject(Renderer2);
  private elementRef: ElementRef = inject(ElementRef);

  icon = input.required<string>();
  items = input.required<DropdownItem[]>();
  selected = model.required<number>();

  isDropdownOpen = signal<boolean>(false);

  private documentClickListener?: (() => void);

  selectItem(index: number): void {
    if (this.selected() === index) {
      this.selected.set(-1);
    } else {
      this.selected.set(index);
    }
    this.toggleDropdown();
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(value => !value);
    if (this.isDropdownOpen()) {
      this.addClickOutsideListener();
    } else {
      this.removeClickOutsideListener();
    }
  }

  private addClickOutsideListener(): void {
    this.documentClickListener = this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.toggleDropdown();
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
