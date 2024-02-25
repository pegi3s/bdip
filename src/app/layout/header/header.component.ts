import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchGuidedComponent } from "../../search-guided/search-guided.component";
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    imports: [RouterLink, SearchGuidedComponent]
})
export class HeaderComponent {
  private firstScrollHandled = false;
  private touchStartY = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private location: Location
  ) {
  }

  ngAfterViewInit() {
    const header = this.el.nativeElement.querySelector('header');

    /*TODO: Fix*/
    console.log(this.location.path());
    if (this.location.path() !== '') {
      this.renderer.addClass(header, 'scrolled');
      this.firstScrollHandled = true;
    }

    //TODO: FIX
    this.renderer.listen(header, 'click', (event) => {
      if (event.target.tagName.toLowerCase() === 'a') {
        return;
      }

      if (this.firstScrollHandled) {
        window.scrollTo(0, 0);
        this.renderer.removeClass(header, 'scrolled');
        this.firstScrollHandled = false;
      }
    });
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.firstScrollHandled && event.deltaY > 0) {
      const header = this.el.nativeElement.querySelector('header');
      if (this.router.url === '/')
        this.router.navigate(['/about']);
      this.renderer.addClass(header, 'scrolled');
      this.firstScrollHandled = true;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (this.touchStartY > touchEndY && !this.firstScrollHandled) {
      const header = this.el.nativeElement.querySelector('header');
      if (this.router.url === '/')
        this.router.navigate(['/about']);
      this.renderer.addClass(header, 'scrolled');
      this.firstScrollHandled = true;
    }
  }
}
